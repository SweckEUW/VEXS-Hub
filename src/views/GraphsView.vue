<template>

  <!-- Overlay Menu for Graph Creation -->
  <CreateGraphDialog v-model:visible="showCreateDialog" />

  <!-- Overlay Menu for Graph Actions: Delete, Run, ... -->
  <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" :pt="{ submenuLabel: { style: 'padding: 0' } }" :dt="{ item: { padding: '0.75rem 1rem' } }"/>

  <!-- Actual Graphs Display -->
  <div class="h-full overflow-auto p-6">

    <div class="mb-6 flex items-end justify-between gap-3">
      <PageHeader
        title="Graphs"
        subtitle="Graphs are automations built from nodes. Assign a graph to a hook and it runs on the farm whenever that event happens."
      />
      <Button type="button" label="New Graph" icon="pi pi-plus" severity="primary" outlined @click="showCreateDialog = true" aria-haspopup="true" aria-controls="overlay_menu" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>

    <DataTable :value="graphs" :loading="isLoading" data-key="id" row-hover :dt="{ bodyCell: { padding: '2rem 1rem' } }">
      <template #empty>
        <span v-if="!isLoading" class="text-surface-300">Keine Graphen vorhanden.</span>
      </template>

      <!-- Name -->
      <Column header="GRAPH" style="width: 200px" >
        <template #body="{ data } : { data: VexsGraph }">
          <div class="flex-col gap-2">
            <div class="text-l font-bold">{{ data.name }}</div>
            <div class="text-m text-surface-300">{{ data.description ?? 'Keine Beschreibung' }}</div>
          </div>
        </template>
      </Column>

      <!-- Used In Hooks -->
      <Column header="USED IN HOOKS">
        <template #body="{ data } : { data: VexsGraph }">
          <div class="flex flex-col gap-2">
            <div v-for="connection in getHookConnectionsForGraph(data.id)" :key="connection.id" class="text-nowrap block bg-surface-500 p-2 rounded-md flex items-center gap-2">
              <i :class="'pi pi-' + getHookById(connection.hook_id)?.icon"/>
              <div>{{ getHookById(connection.hook_id)?.name }}</div>
            </div>
          </div>
          <div v-if="getHookConnectionsForGraph(data.id).length === 0" class="text-surface-300 outline-[1px] rounded-md p-4 outline-dotted">
            <i :class="'pi pi-asterisk'"/>
            <span class="ml-2">Not used in any hook</span>
          </div>
        </template>
      </Column>

      <!-- Created At -->
      <Column header="CREATED" >
        <template #body="{ data } : { data: VexsGraph }">
          <div class="text-surface-300">{{ new Date(data.created_at).toLocaleString() }}</div>
        </template>
      </Column>

      <!-- Last Modified -->
      <Column field="updated_at" header="LAST MODIFIED" >
        <template #body="{ data } : { data: VexsGraph }">
          <div class="text-surface-300">{{ new Date(data.updated_at).toLocaleString() }}</div>
        </template>
      </Column>

      <!-- Last Run -->
      <Column header="LAST RUN" />

      <!-- Actions -->
      <Column header="ACTIONS" :pt="{ columnHeaderContent: { class: 'justify-end' } }">
        <template #body="{ data }: { data: VexsGraph }">
          <div class="flex justify-end gap-2">
            <Button class="min-w-[150px]" label="Open in Editor" icon="pi pi-pencil" severity="secondary" outlined @click.stop="openGraph(data.id)" />
            <Button
              type="button"
              icon="pi pi-ellipsis-v"
              severity="secondary"
              outlined
              @click="toggle($event, data)"
              aria-haspopup="true"
              aria-controls="overlay_menu"
            />
          </div>
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Menu from 'primevue/menu';
import PageHeader from '@/components/PageHeader.vue';
import type { VexsGraph } from '@/api/graph.api';
import type { MenuItem } from 'primevue/menuitem';
import CreateGraphDialog from '@/components/CreateGraphDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";
import { useVexsApi } from '@/composables/useVexsApi';

const router = useRouter();
const toast = useToast();
const {
  graphs, isLoading: loading, errors,
  loadGraphs, loadHooks, loadHookConnections,
  deleteGraph, executeGraph, getHookById, getHookConnectionsForGraph
} = useVexsApi();

const isLoading = computed(() => loading.graphs || loading.hooks || loading.hookConnections);
const error = computed(() => errors.graphs ?? errors.hooks ?? errors.hookConnections);
const showCreateDialog = ref(false);
const menu = useTemplateRef('menu')
const selectedGraph = ref<VexsGraph | null>(null);

// Cached - only the first visit triggers requests
onMounted(async () => {
  await loadHookConnections();
  await loadHooks();
  await loadGraphs();
});
  
const items = ref<MenuItem[]>([
  {
    items: [
      {
        label: 'Run Test',
        icon: 'pi pi-play',
        command: async () => {
          if (selectedGraph.value) {
            console.log('Run graph:', selectedGraph.value.id);
            await executeGraph(selectedGraph.value.id);
            toast.add({ severity: 'success', summary: 'Graph executed', detail: `Graph ${selectedGraph.value.name} has been executed.`, life: 3000 });
          }
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          if (selectedGraph.value) {
            deleteGraphFromView(selectedGraph.value);
            toast.add({ severity: 'success', summary: 'Graph deleted', detail: `Graph ${selectedGraph.value.name} has been deleted.`, life: 3000 });
          }
        }
      }
    ]
  }
]);

const toggle = (event: MouseEvent, graph: VexsGraph) => {
  selectedGraph.value = graph;
  menu.value?.toggle(event);
};

const deleteGraphFromView = async (graph: VexsGraph) => {
  console.log('Delete graph:', graph.id);

  // Delete Graph via API
  let success = await deleteGraph(graph.id);

  if (!success) {
    toast.add({ severity: 'error', summary: 'Graph deletion failed', life: 3000 });
    return;
  }

  // Show success toast - the graph list is updated by useVexsApi
  toast.add({ severity: 'success', summary: 'Graph deleted', detail: `Graph ${graph.name} has been deleted.`, life: 3000 });
};

const openGraph = (graphId: number) => {
  router.push({ name: 'graph-editor', params: { id: graphId } });
};
</script>