<template>
  <div class="flex h-full w-full flex-col">
    <header class="flex h-11 shrink-0 items-center gap-2 border-b border-surface-600 bg-surface-900 px-3">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="Zurück zur Graph-Übersicht"
        @click="router.push({ name: 'graphs' })"
      />

      <Breadcrumb :model="breadcrumbItems" class="bg-transparent! p-0! text-[0.95rem]">
        <template #item="{ item }">
          <RouterLink
            v-if="item.route"
            :to="item.route"
            class="text-surface-300 no-underline hover:text-surface-100"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else class="text-surface-100">{{ item.label }}</span>
        </template>
      </Breadcrumb>
    </header>

    <div class="min-h-0 w-full flex-1">
      <div v-if="error" class="p-6">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>

      <FlowPipeEditor
        v-else-if="!isLoading && vexsGraph"
        :graph="vexsGraph.flowpipe_graph"
        :nodeLibrary="nodes"
        :saveHandler="handleSave"
        :runHandler="handleRun"
        :displayDownloadButton="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { FlowPipeEditor } from 'flowpipe-web-editor';
import type { SerializedFlowpipeGraph } from 'flowpipe-web-editor';
import type { VexsGraph } from '@/api/graph.api';
import { useToast } from 'primevue/usetoast';
import { useVexsApi } from '@/composables/useVexsApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { nodes, errors, fetchGraph, loadNodes, updateGraph, executeGraph } = useVexsApi();

const graphID = ref(0);
const vexsGraph = ref<VexsGraph | undefined>(undefined);
const isLoading = ref(true);
const graphError = ref<string | null>(null);
const error = computed(() => graphError.value ?? errors.nodes);

// Graphs / <graph name> - falls back to the ID while the graph is still loading
const breadcrumbItems = computed(() => [
  { label: 'Graphs', route: { name: 'graphs' } },
  { label: vexsGraph.value?.name ?? `#${graphID.value}` }
]);

const loadFlowpipeData = async (id: number) => {
  console.log('Loading FlowPipe data for graph ID:', id);

  isLoading.value = true;
  graphError.value = null;

  try {
    // Graph is always fetched fresh, the node library is cached
    vexsGraph.value = await fetchGraph(id);
    await loadNodes();

    console.log('Loaded graph:', vexsGraph.value);
  } catch (e) {
    console.error('Failed to load FlowPipe data:', e);
    graphError.value = `Graph ${id} konnte nicht geladen werden.`;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.id,
  (id) => {
    graphID.value = Number(id);
    loadFlowpipeData(graphID.value);
  },
  { immediate: true }
);

// Save Graph
const handleSave = async (serializedFlowpipeGraph: SerializedFlowpipeGraph) => {
  console.log('Event from FlowPipeEditor - Save - Updating graph');

  try {
    // Don't mutate the cached graph before the save succeeded
    const updatedGraph = await updateGraph(graphID.value, { ...vexsGraph.value!, flowpipe_graph: serializedFlowpipeGraph });
    vexsGraph.value = updatedGraph;
    toast.add({ severity: 'success', summary: 'Graph updated', detail: `Graph ${updatedGraph.name} has been updated.`, life: 3000 });

    console.log('Updated graph:', updatedGraph);
  } catch (e) {
    console.error('Failed to save graph:', e);
    toast.add({ severity: 'error', summary: 'Graph update failed', detail: e instanceof Error ? e.message : String(e), life: 3000 });
  }
};

// Save and Execute Graph (Not really safe to save graph before executing, but for now we will do it this way)
const handleRun = async (serializedFlowpipeGraph: SerializedFlowpipeGraph) => {
  console.log('Event from FlowPipeEditor - Run - Executing graph');

  try {
    // First Save Graph
    const updatedGraph = await updateGraph(graphID.value, { ...vexsGraph.value!, flowpipe_graph: serializedFlowpipeGraph });
    vexsGraph.value = updatedGraph;
    toast.add({ severity: 'success', summary: 'Graph updated', detail: `Graph ${updatedGraph.name} has been updated.`, life: 3000 });

    // Then Execute Graph
    const executionResult = await executeGraph(updatedGraph.id);
    toast.add({ severity: 'success', summary: 'Graph executed', detail: `Graph ${updatedGraph.name} has been executed.`, life: 3000 });

    console.log('Execution result:', executionResult);
  } catch (e) {
    console.error('Failed to save and execute graph:', e);
    toast.add({ severity: 'error', summary: 'Graph execution failed', detail: e instanceof Error ? e.message : String(e), life: 3000 });
  }
};
</script>