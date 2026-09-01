import type { FlowPipeGraph } from '../types/flowpipe';
import { apiClient } from './client';

// Fetch all FlowPipe graphs for a project
export async function getGraphs(): Promise<FlowPipeGraph[]> {
  const response = await apiClient.get<FlowPipeGraph[]>(`/api/v1/graphs/`);
  
  if (!response.data) throw new Error('Graphs not found');
  
  return response.data;
}

export async function getGraphById(id: number): Promise<FlowPipeGraph> {
  const response = await apiClient.get<FlowPipeGraph>(`/api/v1/graphs/${id}/`);

  if (!response.data) throw new Error('Graphs not found');
  
  return response.data;
}

export async function createGraph(graph: Omit<FlowPipeGraph, 'id'>): Promise<FlowPipeGraph> {
  const response = await apiClient.post<FlowPipeGraph>(`/api/v1/graphs/`, graph);
  return response.data;
}

export async function updateGraph(id: number, graph: Partial<Omit<FlowPipeGraph, 'id'>>): Promise<FlowPipeGraph> {
  const response = await apiClient.put<FlowPipeGraph>(`/api/v1/graphs/${id}/`, graph);
  return response.data;
}

export async function deleteGraph(id: number): Promise<boolean> {
  const response = await apiClient.delete(`/api/v1/graphs/${id}/`);
  return response.data;
}