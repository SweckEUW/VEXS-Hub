import { apiClient } from './client';
import { VexsGraph } from './graph.api';

const VEXS_HOOKS_CONNECTIONS_API_BASE_URL = '/api/v1/vexshooksconnections/';

export interface VexsHookConnection {
  id: number;
  vexs_graph: VexsGraph;
  hook_id: number;
  created_at: string;
  updated_at: string;
}

export type VexsHookConnectionCreate = Omit<VexsHookConnection, 'id' | "created_at" | "updated_at" | "vexs_graph">& {
  vexs_graph_id: number;
};

// Fetch all FlowPipe graphs for a project
export async function getHookConnections(): Promise<VexsHookConnection[]> {
  const response = await apiClient.get<VexsHookConnection[]>(VEXS_HOOKS_CONNECTIONS_API_BASE_URL);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function getHookConnectionsFromVexsGraph(vexsGraphID: number): Promise<VexsHookConnection[]> {
  const response = await apiClient.get<VexsHookConnection[]>(VEXS_HOOKS_CONNECTIONS_API_BASE_URL + `/vexsgraph/${vexsGraphID}/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function getHookConnectionsFromVexsHook(vexsHookID: number): Promise<VexsHookConnection[]> {
  const response = await apiClient.get<VexsHookConnection[]>(VEXS_HOOKS_CONNECTIONS_API_BASE_URL + `/vexshook/${vexsHookID}/`);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function createHookConnection(hookConnection: VexsHookConnectionCreate): Promise<VexsHookConnection> {
  const response = await apiClient.post<VexsHookConnection>(VEXS_HOOKS_CONNECTIONS_API_BASE_URL, hookConnection);
  return response.data;
}

export async function deleteHookConnection(id: number): Promise<boolean> {
  const response = await apiClient.delete(VEXS_HOOKS_CONNECTIONS_API_BASE_URL + `${id}/`);
  return response.data;
}