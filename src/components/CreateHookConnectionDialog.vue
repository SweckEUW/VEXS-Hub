<template>
  <Dialog v-model:visible="visible" modal header="New Connection" @hide="reset">
    <span class="p-text-secondary block mb-5">Give it a name that says what it does. You can change everything later in the editor.</span>

    <div class="flex flex-col gap-2 mb-4">
      <MultiSelect 
        v-model="selectedGraphs"
        :options="graphs"
        :optionDisabled="isConnected"
        optionLabel="name"
        filter
        display="chip"
        checkmark
        :loading="isLoading"
        :placeholder="isLoading? 'Loading...' : 'Select a graph'"
        class="w-full md:w-56"
        :pt="{ option: { class: 'flex-row-reverse justify-between' } }"
      >
        <template #option="slotProps">
          <div class="flex items-center gap-2">
            <span>{{ slotProps.option.name }}</span>
            <span>-</span>
            <span class="text-gray-400">{{ slotProps.option.description }}</span>
            <span v-if="isConnected(slotProps.option)" class="ml-auto text-xs text-surface-400">Already connected</span>
          </div>
        </template>
        <template #footer>
          <div class="py-2 px-3">
            <b>{{ selectedGraphs ? selectedGraphs.length : 0 }}</b> item{{ (selectedGraphs ? selectedGraphs.length : 0) > 1 ? 's' : '' }} selected.
          </div>
        </template>
      </MultiSelect >
    </div>

    <div class="flex justify-end gap-2 mt-12">
      <Button type="button" label="Cancel" severity="secondary" outlined @click="visible = false" />
      <Button type="button" label="Create Connection" outlined :loading="isSaving" @click="createHookConnectionLocal" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import MultiSelect  from 'primevue/multiselect';
import type { VexsGraph } from '@/api/graph.api';
import { computed, ref, watch } from 'vue';
import type { VexsHook } from '@/api/hook.api';
import type { VexsHookConnectionCreate } from '@/api/hookConnection.api';
import { useToast } from 'primevue/usetoast';
import { useVexsApi } from '@/composables/useVexsApi';

interface CreateHookConnectionDialogProps {
  selectedHook: VexsHook | null;
  connectedGraphIds?: number[];
}

const { selectedHook, connectedGraphIds = [] } = defineProps<CreateHookConnectionDialogProps>()

const toast = useToast();
const { graphs, isLoading: loading, loadGraphs, createHookConnection } = useVexsApi();

const selectedGraphs = ref<VexsGraph[]>([]);
const visible = defineModel<boolean>('visible', { default: false });
const isLoading = computed(() => loading.graphs);
const isSaving = ref(false);

// Cached - only requests the graphs if they are not loaded yet
watch(() => visible.value, (newVal) => {
  if (newVal) {
    loadGraphs();
  }
});

const isConnected = (graph: VexsGraph) => connectedGraphIds.includes(graph.id);

const createHookConnectionLocal = async () => {
  if (!selectedHook || !selectedGraphs.value.length) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please select a graph to create a connection.', life: 3000 });
    return;
  }

  isSaving.value = true;
  let createdCount = 0;

  try {
    // Create connections one after another, parallel requests break the backend
    for (const graph of selectedGraphs.value) {
      const hookId = selectedHook.id;
      const vexsGraphId = graph.id;

      console.log('Create Hook Connection:', hookId, vexsGraphId);

      const hookConnection: VexsHookConnectionCreate = {
        hook_id: hookId,
        vexs_graph_id: vexsGraphId
      };

      try {
        const newConnection = await createHookConnection(hookConnection);
        createdCount++;
        console.log('Created Hook Connection:', newConnection);
      } catch (e) {
        console.error('Failed to create Hook Connection:', e);

        toast.add({ severity: 'error', summary: 'Hook Connection creation failed', detail: `${graph.name}: ${e instanceof Error ? e.message : String(e)}`, life: 3000 });
      }
    }

    if (createdCount) {
      toast.add({ severity: 'success', summary: 'Hook Connection created', detail: `${createdCount} Hook Connection${createdCount > 1 ? 's' : ''} created.`, life: 3000 });
    }
  } finally {
    isSaving.value = false;
    visible.value = false;
  }
};

const reset = () => {
  selectedGraphs.value = [];
};
</script>