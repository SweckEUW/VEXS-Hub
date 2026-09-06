<template>
  <div style="width: 100%; height: 100%;">
    <FlowPipeEditor style="width: 100%; height: 100%;" v-if="!isLoading" :flowpipe-json="graph!.flowpipe_graph" :save-handler="handleSave" />
  </div>
</template>

<script setup lang="ts">
import {FlowPipeEditor} from 'flowpipe-web-editor';
import { getGraphById, updateGraph } from './api/shotgrid.api';
import { ref } from 'vue';
import type { FlowPipeGraph } from './types/flowpipe.ts';

let isLoading = ref(true);

let graphID = 68;
let graph: FlowPipeGraph | undefined = undefined;

let loadFlowpipeGraph = async () => {
  graph = await getGraphById(graphID);
  isLoading.value = false;  
};
loadFlowpipeGraph();

let handleSave = async (flowpipeJson: string) => {
  console.log('Event from FlowPipeEditor - Save - Updating graph');

  graph!.name = "Update " + new Date().toLocaleString('de-DE');
  graph!.flowpipe_graph = flowpipeJson;
  let updatedGraph = await updateGraph(graphID, graph!);

  console.log('Updated graph:', updatedGraph);
};
</script>