<template>

  <!-- Overlay Menu for Connection Creation -->
  <CreateHookConnectionDialog v-model:visible="showCreateDialog" :selectedHook="selectedHook" :connectedGraphIds="connectedGraphIds"/>

  <!-- Actual Graphs Display -->
  <div class="h-full overflow-auto p-6">

    <div class="mb-6 flex items-end justify-between gap-3">
      <PageHeader title="Hooks" subtitle="Hooks are pipeline events. When a hook fires, its assigned graphs run on the farm one after another, in the order shown." />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>


    <DataTable :value="hooks" :loading="isLoading" data-key="id" row-hover :dt="{ bodyCell: { padding: '2rem 1rem' } }"> 
      <template #empty>
        <span v-if="!isLoading" class="text-surface-300">Keine Graphen vorhanden.</span>
      </template>

      <!-- Name -->
      <Column header="HOOK" class="max-w-[300px] align-top">
        <template #body="{ data } : { data: VexsHook }">
          <!-- <Button type="button" label="Execute Hook" icon="pi pi-play" severity="primary" outlined @click="executeHook(data.id)" aria-haspopup="true" aria-controls="overlay_menu" /> -->

          <div class="flex gap-4 justify-start">
            <Card class="h-[45px] w-[45px] flex items-center justify-center" :dt="{ root: { background: '#1e293b', color: '#f8fafc' } }">
              <template #content>
                <i :class="'pi pi-' + data.icon"/>
              </template>
            </Card>
            <div class="flex-col gap-2">
              <div class="text-l font-bold">{{ data.name }}</div>
              <div class="text-m text-surface-300">{{ data.description }}</div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Used In Hooks -->
      <Column header="CONNECTED GRAPHS" class="align-top">
        <template #body="{ data } : { data: VexsHook }" >
          <div class="flex flex-col gap-2 pb-5">
            <div class="flex justify-end">
              <Button class="min-w-[120px]" type="button" label="Assign Graph" icon="pi pi-plus" severity="primary" outlined @click="openVexsHookConnectionMenu(data)" aria-haspopup="true" aria-controls="overlay_menu" />
            </div>

            <div class="min-w-[400px]">
              <div v-for="connection in getHookConnectionsForHook(data.id)" :key="connection.id" class="flex justify-between items-center bg-surface-900 p-4 rounded-md">
                <div class="flex flex-col">
                  <div class="text-nowrap">{{ connection.vexs_graph.name }}</div>
                  <div class="text-surface-300">{{ connection.vexs_graph.description }}</div>
                </div>

                <div class="flex jusify-center items-center gap-2">
                  <div class="flex jusify-center items-center gap-2">
                    <ToggleSwitch :defaultValue="true"/>
                    <span v-tooltip.bottom="{ value: 'Enable/Disable Connection', showDelay: 500 }" class="mr-2">Enabled</span>
                  </div>
                  <Button v-tooltip.bottom="{ value: 'Delete Connection', showDelay: 500 }" icon="pi pi-times" variant="text" severity="contrast" outlined @click="deleteHookConnectionLocal(connection.id)"/>
                </div>
              </div>

              <!-- No Connections -->
              <div v-if="getHookConnectionsForHook(data.id).length === 0" class="text-surface-300 outline-[1px] rounded-md p-4 outline-dotted">
                <i :class="'pi pi-asterisk'"/>
                No graphs assigned – this event currently does nothing
              </div>
            </div>
          </div>
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import PageHeader from '@/components/PageHeader.vue';
import type { MenuItem } from 'primevue/menuitem';
import CreateHookConnectionDialog from '@/components/CreateHookConnectionDialog.vue';
import type { VexsHook } from '@/api/hook.api';
import { useToast } from 'primevue/usetoast';
import { useVexsApi } from '@/composables/useVexsApi';

const toast = useToast();
const {
  hooks, isLoading: loading, errors,
  loadHooks, loadHookConnections,
  deleteHookConnection, getHookConnectionsForHook, executeHook
} = useVexsApi();

const isLoading = computed(() => loading.hooks || loading.hookConnections);
const error = computed(() => errors.hooks ?? errors.hookConnections);
const showCreateDialog = ref(false);
const selectedHook = ref<VexsHook | null>(null);

// Cached - only the first visit triggers requests
onMounted(async () => {
  await loadHookConnections();
  await loadHooks();
});
  
const openVexsHookConnectionMenu = (hook: VexsHook) => {
  selectedHook.value = hook;
  showCreateDialog.value = true;
};

const connectedGraphIds = computed(() =>
  selectedHook.value ? getHookConnectionsForHook(selectedHook.value.id).map(conn => conn.vexs_graph.id) : []
);

const deleteHookConnectionLocal = async (connectionId: number) => {
  try {
    const success = await deleteHookConnection(connectionId);
    if (success) {
      toast.add({ severity: 'success', summary: 'Hook Connection deleted', detail: `Hook Connection ${connectionId} has been deleted.`, life: 3000 });
      console.log(`Deleted Hook Connection with ID: ${connectionId}`);
    } else {
      toast.add({ severity: 'error', summary: 'Hook Connection failed to delete', detail: `Hook Connection ${connectionId} failed to be deleted.`, life: 3000 });
      console.error(`Failed to delete Hook Connection with ID: ${connectionId}`);
    }
  } catch (e) {
    console.error('Error deleting Hook Connection:', e);
  }
};
</script>