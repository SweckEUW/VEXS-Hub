import { apiClient } from './client';
import type { SerializedFlowpipeNode } from 'flowpipe-web-editor';

// Fetch all FlowPipe nodes for a project
export async function getNodes(): Promise<SerializedFlowpipeNode[]> {
  const response = await apiClient.get<SerializedFlowpipeNode[]>(`/api/v1/nodes/`);
  
  if (!response.data) throw new Error('Nodes not found');
  
  return response.data;
}
