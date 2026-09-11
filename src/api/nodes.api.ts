import { apiClient } from './client';
import type { FlowPipeNode } from 'flowpipe-web-editor';

// Fetch all FlowPipe nodes for a project
export async function getNodes(): Promise<FlowPipeNode[]> {
  const response = await apiClient.get<FlowPipeNode[]>(`/api/v1/nodes/`);
  
  if (!response.data) throw new Error('Nodes not found');
  
  return response.data;
}
