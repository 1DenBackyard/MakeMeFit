/** Requests API. */
import { apiClient } from './client';

export type TrackType = 'supplements' | 'workouts';

export interface RequestCreate {
  track: TrackType;
  form_data: Record<string, unknown>;
}

export interface RequestResponse {
  id: number;
  user_id: number;
  track: TrackType;
  status: string;
  form_data: Record<string, unknown>;
  anti_fraud_passed: boolean;
  demo_answer?: string;
  full_answer?: string;
  suggested_activity_type?: string;
  created_at: string;
}

export interface DemoResponse {
  request_id: number;
  demo_answer: string;
  requires_payment: boolean;
  message: string;
}

export interface FullAnswerResponse {
  request_id: number;
  full_answer: string;
  pdf_url?: string;
  pdf_size_bytes?: number;
}

export async function createRequest(data: RequestCreate): Promise<RequestResponse> {
  return apiClient.post<RequestResponse>('/requests/', data);
}

export async function getDemo(requestId: number): Promise<DemoResponse> {
  return apiClient.get<DemoResponse>(`/requests/${requestId}/demo`);
}

export async function generateFullAnswer(requestId: number): Promise<FullAnswerResponse> {
  return apiClient.post<FullAnswerResponse>(`/requests/${requestId}/full`);
}

export async function getHistory(): Promise<RequestResponse[]> {
  return apiClient.get<RequestResponse[]>('/requests/');
}
