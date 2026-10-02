import { apiClient } from './client';
import { ExecutionMode } from './graph.api';

const VEXS_HOOKS_API_BASE_URL = '/api/v1/vexshooks/';

export interface VexsHook {
  id: number;
  name: string;
  description: string;
  icon: string;
}

// Fetch all FlowPipe graphs for a project
export async function getHooks(): Promise<VexsHook[]> {
  const response = await apiClient.get<VexsHook[]>(VEXS_HOOKS_API_BASE_URL);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}

export async function executeHook(id: number,mode: ExecutionMode = 'local'): Promise<boolean> {
  const response = await apiClient.post(VEXS_HOOKS_API_BASE_URL + `${id}/execute/`, null, { params: { mode } });
  return response.data;
}