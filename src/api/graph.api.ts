import { apiClient } from './client';
import { SerializedFlowpipeGraph } from 'flowpipe-web-editor';

const VEXS_GRAPH_API_BASE_URL = '/api/v1/vexsgraphs/';

export type ExecutionMode = 'deadline' | 'local';

export interface DeadlineSubmittedJob {
  job_id: string;
  name: string;
  node_identifiers: string[];
}

export interface VexsGraphExecutionResponse {
  mode: ExecutionMode;
  status: 'success' | 'submitted';   // local: 'success', deadline: 'submitted'
  submission_id: string | null;
  batch_name: string | null;
  jobs: DeadlineSubmittedJob[];
}

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
  const response = await apiClient.get<VexsGraph[]>(VEXS_GRAPH_API_BASE_URL);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function getGraphById(id: number): Promise<VexsGraph> {
  const response = await apiClient.get<VexsGraph>(VEXS_GRAPH_API_BASE_URL + `${id}/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function createGraph(graph: VexsGraphCreate): Promise<VexsGraph> {
  console.log('Creating graph:', graph);
  const response = await apiClient.post<VexsGraph>(VEXS_GRAPH_API_BASE_URL, graph);
  return response.data;
}

export async function updateGraph(id: number, graph: VexsGraphUpdate): Promise<VexsGraph> {
  const response = await apiClient.put<VexsGraph>(VEXS_GRAPH_API_BASE_URL + `${id}/`, graph);
  return response.data;
}

export async function deleteGraph(id: number): Promise<boolean> {
  const response = await apiClient.delete(VEXS_GRAPH_API_BASE_URL + `${id}/`);
  return response.data;
}

export async function executeGraph(id: number,mode: ExecutionMode = 'local'): Promise<VexsGraphExecutionResponse> {
  const response = await apiClient.post<VexsGraphExecutionResponse>(VEXS_GRAPH_API_BASE_URL + `${id}/execute/`, null, { params: { mode } });
  return response.data;
}
