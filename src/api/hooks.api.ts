import { apiClient } from './client';
import { SerializedFlowpipeGraph } from 'flowpipe-web-editor';

const VEXS_HOOKS_CONNECTIONS_API_BASE_URL = '/api/v1/vexsgraphs/';

export interface Hook {
  id: number;
  name: string;
  description?: string;
  flowpipe_graph: SerializedFlowpipeGraph;
  created_at: string;
  updated_at: string;
}

export type VexsGraphCreate = Omit<VexsGraph, 'id' | "created_at" | "updated_at">;
export type VexsGraphUpdate = Partial<VexsGraphCreate>;

// Fetch all FlowPipe graphs for a project
export async function getGraphs(): Promise<VexsGraph[]> {
  const response = await apiClient.get<VexsGraph[]>(GRAPH_API_BASE_URL);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function getGraphById(id: number): Promise<VexsGraph> {
  const response = await apiClient.get<VexsGraph>(GRAPH_API_BASE_URL + `${id}/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function createGraph(graph: VexsGraphCreate): Promise<VexsGraph> {
  console.log('Creating graph:', graph);
  const response = await apiClient.post<VexsGraph>(GRAPH_API_BASE_URL, graph);
  return response.data;
}

export async function updateGraph(id: number, graph: VexsGraphUpdate): Promise<VexsGraph> {
  const response = await apiClient.put<VexsGraph>(GRAPH_API_BASE_URL + `${id}/`, graph);
  return response.data;
}

export async function deleteGraph(id: number): Promise<boolean> {
  const response = await apiClient.delete(GRAPH_API_BASE_URL + `${id}/`);
  return response.data;
}

export async function executeGraph(id: number): Promise<any> {
  const response = await apiClient.post(GRAPH_API_BASE_URL + `${id}/execute/`);
  return response.data;
}
