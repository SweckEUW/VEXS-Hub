import { apiClient } from './client';
import { SerializedFlowpipeGraph } from 'flowpipe-web-editor';

export interface VexsGraph {
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
  const response = await apiClient.get<VexsGraph[]>(`/api/v1/graphs/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function getGraphById(id: number): Promise<VexsGraph> {
  const response = await apiClient.get<VexsGraph>(`/api/v1/graphs/${id}/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function createGraph(graph: VexsGraphCreate): Promise<VexsGraph> {
  console.log('Creating graph:', graph);
  const response = await apiClient.post<VexsGraph>(`/api/v1/graphs/`, graph);
  return response.data;
}

export async function updateGraph(id: number, graph: VexsGraphUpdate): Promise<VexsGraph> {
  const response = await apiClient.put<VexsGraph>(`/api/v1/graphs/${id}/`, graph);
  return response.data;
}

export async function deleteGraph(id: number): Promise<boolean> {
  const response = await apiClient.delete(`/api/v1/graphs/${id}/`);
  return response.data;
}

export async function executeGraph(id: number): Promise<any> {
  const response = await apiClient.post(`/api/v1/graphs/${id}/execute/`);
  return response.data;
}
