<template>
  <div style="width: 100%; height: 100%;">
    <FlowPipeEditor 
      v-if="!isLoading" 
      :flowpipeJson="graph!.flowpipe_graph" 
      :flowpipeNodes="nodes"
      :saveHandler="handleSave" 
    />
  </div>
</template>

<script setup lang="ts">
import { FlowPipeEditor, FlowPipeGraph, FlowpipeNode } from 'flowpipe-web-editor'
import { getGraphById, updateGraph, executeGraph } from './api/graph.api';
import { getNodes } from './api/nodes.api';
import { ref } from 'vue';

let isLoading = ref(true);

let graphID = 68;
let graph: FlowPipeGraph | undefined = undefined;
let nodes: FlowpipeNode[] = [];

let loadFlowpipeData = async () => {
  console.log("Loading FlowPipe data for graph ID:", graphID);

  graph = await getGraphById(graphID);
  nodes = await getNodes();

  console.log('Loaded graph:', graph);
  console.log('Loaded nodes:', nodes);

  isLoading.value = false;  
};
loadFlowpipeData();

let handleSave = async (flowpipeJson: string) => {
  // Safe Graph
  console.log('Event from FlowPipeEditor - Save - Updating graph');
  graph!.name = "Update " + new Date().toLocaleString('de-DE');
  graph!.flowpipe_graph = flowpipeJson;
  let updatedGraph = await updateGraph(graphID, graph!);
  console.log('Updated graph:', updatedGraph);

  // Execute Graph
  console.log('Executing graph');
  let executionResult = await executeGraph(graphID);
  console.log('Execution result:', executionResult);
};
</script>

<style>
  html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    background: #1a1a1a;
    color: #cccccc;
  }
</style>
