import { apiClient } from './client';
import type { SerializedFlowpipeNode } from 'flowpipe-web-editor';

const FLOWPIPE_NODES_API_BASE_URL = '/api/v1/flowpipenodes/';

// Fetch all FlowPipe nodes for a project
export async function getNodes(): Promise<SerializedFlowpipeNode[]> {
  const response = await apiClient.get<SerializedFlowpipeNode[]>(FLOWPIPE_NODES_API_BASE_URL);
  
  if (!response.data) throw new Error('Nodes not found');
  
  return response.data;
}
