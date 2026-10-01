<template>

  <!-- Overlay Menu for Graph Creation -->
  <CreateGraphDialog v-model:visible="showCreateDialog" />

  <!-- Overlay Menu for Graph Actions: Delete, Run, ... -->
  <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />

  <!-- Actual Graphs Display -->
  <div class="h-full overflow-auto p-6">

    <div class="mb-6 flex items-end justify-between gap-3">
      <PageHeader title="Hooks" subtitle="Hooks are pipeline events. When a hook fires, its assigned graphs run on the farm one after another, in the order shown." />
      <Button type="button" label="New Graph" icon="pi pi-plus" severity="primary" outlined @click="showCreateDialog = true" aria-haspopup="true" aria-controls="overlay_menu" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>

    <DataTable :value="hooks" :loading="isLoading" data-key="id" row-hover>
      <template #empty>
        <span class="text-surface-300">Keine Graphen vorhanden.</span>
      </template>

      <!-- Name -->
      <Column header="HOOK" >
        <template #body="{ data } : { data: VexsHook }">
          <div class="flex-col gap-2">
            <div class="text-l font-bold">{{ data.name }}</div>
            <div class="text-m text-surface-300">{{ data.description }}</div>
          </div>
        </template>
      </Column>

      <!-- Used In Hooks -->
      <Column header="GRAPHS" >
        <template #body="{ data } : { data: VexsHook }" >
          TODO: Show the graphs that are connected to this hook (make api call to get hook connection with hook id in the hook connection api)
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Menu from 'primevue/menu';
import PageHeader from '@/components/PageHeader.vue';
import type { MenuItem } from 'primevue/menuitem';
import CreateGraphDialog from '@/components/CreateGraphDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";
import { getHooks, VexsHook } from '../api/hook.api';
import { getHookConnections, VexsHookConnection } from '../api/hookConnection.api';

const router = useRouter();
const toast = useToast();

const hooksConnections = ref<VexsHookConnection[]>([]);
const hooks = ref<VexsHook[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showCreateDialog = ref(false);

const loadGraphs = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    hooksConnections.value = await getHookConnections();
    console.log('Loaded Hook Connections:', hooksConnections.value);
  } catch (e) {
    console.error('Failed to load Hook Connections: ', e);
    error.value = 'Failed to load Hook Connections: ' + (e instanceof Error ? e.message : String(e));
  } finally {
    isLoading.value = false;
  }
};

const loadHooks = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    hooks.value = await getHooks();
    console.log('Loaded Hooks:', hooks.value);
  } catch (e) {
    console.error('Failed to load Hooks: ', e);
    error.value = 'Failed to load Hooks: ' + (e instanceof Error ? e.message : String(e));
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadGraphs();
  loadHooks();
}
);
  
const items = ref<MenuItem[]>([
  {
    label: 'Actions',
    items: [
      {
        label: 'Run Test',
        icon: 'pi pi-play',
        command: () => {
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
        }
      }
    ]
  }
]);

</script>