import { reactive, ref, type Ref } from 'vue';
import type { SerializedFlowpipeNode } from 'flowpipe-web-editor';
import * as graphApi from '@/api/graph.api';
import * as hookApi from '@/api/hook.api';
import * as hookConnectionApi from '@/api/hookConnection.api';
import * as nodesApi from '@/api/nodes.api';
import type { ExecutionMode, VexsGraph, VexsGraphCreate, VexsGraphExecutionResponse, VexsGraphUpdate } from '@/api/graph.api';
import type { VexsHook } from '@/api/hook.api';
import type { VexsHookConnection, VexsHookConnectionCreate } from '@/api/hookConnection.api';

type Resource = 'graphs' | 'hooks' | 'hookConnections' | 'nodes';

// Shared state on module level - every component calling useVexsApi() works on the same data.
// Only modify it through the functions below, so the cache stays consistent.
const graphs = ref<VexsGraph[]>([]);
const hooks = ref<VexsHook[]>([]);
const hookConnections = ref<VexsHookConnection[]>([]);
const nodes = ref<SerializedFlowpipeNode[]>([]);

const isLoading = reactive<Record<Resource, boolean>>({ graphs: false, hooks: false, hookConnections: false, nodes: false });
const errors = reactive<Record<Resource, string | null>>({ graphs: null, hooks: null, hookConnections: null, nodes: null });

// Cache bookkeeping: what is already loaded and which requests are still running
const loaded: Record<Resource, boolean> = { graphs: false, hooks: false, hookConnections: false, nodes: false };
const pending: Partial<Record<Resource, Promise<void>>> = {};

// Load a resource once and reuse it afterwards. Errors are stored in `errors` instead of being thrown.
const loadResource = <T>(key: Resource, label: string, fetcher: () => Promise<T[]>, target: Ref<T[]>): Promise<void> => {
  if (loaded[key]) return Promise.resolve();
  if (pending[key]) return pending[key];

  isLoading[key] = true;
  errors[key] = null;

  const request = (async () => {
    try {
      target.value = await fetcher();
      loaded[key] = true;
      console.log(`Loaded ${label}:`, target.value);
    } catch (e) {
      console.error(`Failed to load ${label}: `, e);
      errors[key] = `Failed to load ${label}: ` + (e instanceof Error ? e.message : String(e));
    } finally {
      isLoading[key] = false;
      delete pending[key];
    }
  })();

  pending[key] = request;
  return request;
};

const loadGraphs = () => loadResource('graphs', 'graphs', graphApi.getGraphs, graphs);
const loadHooks = () => loadResource('hooks', 'Hooks', hookApi.getHooks, hooks);
const loadHookConnections = () => loadResource('hookConnections', 'Hook Connections', hookConnectionApi.getHookConnections, hookConnections);
const loadNodes = () => loadResource('nodes', 'nodes', nodesApi.getNodes, nodes);

// Insert or replace a graph in the cache
const upsertGraph = (graph: VexsGraph) => {
  const index = graphs.value.findIndex(g => g.id === graph.id);
  if (index === -1) graphs.value.push(graph);
  else graphs.value[index] = graph;

  // Hook connections carry their own copy of the graph - keep it in sync
  for (const connection of hookConnections.value) {
    if (connection.vexs_graph.id === graph.id) connection.vexs_graph = graph;
  }
};

// Hooks
const executeHook = (id: number, mode?: ExecutionMode): Promise<boolean> => hookApi.executeHook(id, mode);

// Graphs

// Always fetches the latest version from the backend (e.g. for the editor)
const fetchGraph = async (id: number): Promise<VexsGraph> => {
  const graph = await graphApi.getGraphById(id);
  upsertGraph(graph);
  return graph;
};

const createGraph = async (data: VexsGraphCreate): Promise<VexsGraph> => {
  const graph = await graphApi.createGraph(data);
  upsertGraph(graph);
  return graph;
};

const updateGraph = async (id: number, data: VexsGraphUpdate): Promise<VexsGraph> => {
  const graph = await graphApi.updateGraph(id, data);
  upsertGraph(graph);
  return graph;
};

const deleteGraph = async (id: number): Promise<boolean> => {
  const success = await graphApi.deleteGraph(id);

  if (success) {
    graphs.value = graphs.value.filter(g => g.id !== id);
    hookConnections.value = hookConnections.value.filter(conn => conn.vexs_graph.id !== id);
  }

  return success;
};

const executeGraph = (id: number, mode?: ExecutionMode): Promise<VexsGraphExecutionResponse> => graphApi.executeGraph(id, mode);

// Hook Connections
const createHookConnection = async (data: VexsHookConnectionCreate): Promise<VexsHookConnection> => {
  const connection = await hookConnectionApi.createHookConnection(data);
  hookConnections.value.push(connection);
  return connection;
};

const deleteHookConnection = async (id: number): Promise<boolean> => {
  const success = await hookConnectionApi.deleteHookConnection(id);

  if (success) {
    hookConnections.value = hookConnections.value.filter(conn => conn.id !== id);
  }

  return success;
};



// Lookups on the cached data
const getHookById = (id: number) => hooks.value.find(hook => hook.id === id);
const getHookConnectionsForGraph = (graphId: number) => hookConnections.value.filter(conn => conn.vexs_graph.id === graphId);
const getHookConnectionsForHook = (hookId: number) => hookConnections.value.filter(conn => conn.hook_id === hookId);

export function useVexsApi() {
  return {
    // State
    graphs,
    hooks,
    hookConnections,
    nodes,
    isLoading,
    errors,

    // Loading (cached)
    loadGraphs,
    loadHooks,
    loadHookConnections,
    loadNodes,

    // Graphs
    fetchGraph,
    createGraph,
    updateGraph,
    deleteGraph,
    executeGraph,

    // Hook Connections
    createHookConnection,
    deleteHookConnection,
    executeHook,
    
    // Lookups
    getHookById,
    getHookConnectionsForGraph,
    getHookConnectionsForHook,
  };
}
