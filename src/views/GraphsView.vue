<template>

  <!-- Overlay Menu for Graph Creation -->
  <CreateGraphDialog v-model:visible="showCreateDialog" />

  <!-- Overlay Menu for Graph Actions: Delete, Run, ... -->
  <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />

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

    <DataTable
      :value="graphs"
      :loading="isLoading"
      data-key="id"
      row-hover
    >
      <template #empty>
        <span class="text-surface-300">Keine Graphen vorhanden.</span>
      </template>

      <!-- Name -->
      <Column header="GRAPH" >
        <template #body="{ data } : { data: VexsGraph }">
          <div class="flex-col gap-2">
            <div class="text-l font-bold">{{ data.name }}</div>
            <div class="text-m text-surface-300">{{ data.description ?? 'Keine Beschreibung' }}</div>
          </div>
        </template>
      </Column>

      <!-- Used In Hooks -->
      <Column header="USED IN" />

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
            <Button label="Open in Editor" icon="pi pi-pencil" severity="secondary" outlined @click.stop="openGraph(data.id)" />
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
import { onMounted, ref, useTemplateRef } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Menu from 'primevue/menu';
import PageHeader from '@/components/PageHeader.vue';
import { deleteGraph, executeGraph, getGraphs, type VexsGraph } from '@/api/graph.api';
import type { MenuItem } from 'primevue/menuitem';
import CreateGraphDialog from '@/components/CreateGraphDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();

const graphs = ref<VexsGraph[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showCreateDialog = ref(false);
const menu = useTemplateRef('menu')
const selectedGraph = ref<VexsGraph | null>(null);

const loadGraphs = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    graphs.value = await getGraphs();
    console.log('Loaded graphs:', graphs.value);
  } catch (e) {
    console.error('Failed to load graphs: ', e);
    error.value = 'Failed to load graphs: ' + (e instanceof Error ? e.message : String(e));
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadGraphs);
  
const items = ref<MenuItem[]>([
  {
    label: 'Actions',
    items: [
      {
        label: 'Run Test',
        icon: 'pi pi-play',
        command: () => {
          if (selectedGraph.value) {
            runGraphFromView(selectedGraph.value);
          }
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          if (selectedGraph.value) {
            deleteGraphFromView(selectedGraph.value);
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

  // Show success toast and reload graphs
  toast.add({ severity: 'success', summary: 'Graph deleted', detail: `Graph ${graph.name} has been deleted.`, life: 3000 });

  // Reload graphs
  await loadGraphs();
};

const runGraphFromView = async (graph: VexsGraph) => {
  console.log('Run graph:', graph.id);

  executeGraph(graph.id);
};

const openGraph = (graphId: number) => {
  router.push({ name: 'graph-editor', params: { id: graphId } });
};
</script>