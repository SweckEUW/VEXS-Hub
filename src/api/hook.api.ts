import { apiClient } from './client';

const VEXS_HOOKS_API_BASE_URL = '/api/v1/vexshooks/';

export interface VexsHook {
  id: number;
  name: string;
  description: string;
}

// Fetch all FlowPipe graphs for a project
export async function getHooks(): Promise<VexsHook[]> {
  const response = await apiClient.get<VexsHook[]>(VEXS_HOOKS_API_BASE_URL);

  if (!response.data) throw new Error('Graphs not found');

  return response.data;
}