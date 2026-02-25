/** Trainers API. */
import { apiClient } from './client';

export interface TrainerResponse {
  id: number;
  telegram_username: string;
  name: string;
  specialization?: string;
  activity_types?: string[];
  tags?: string[];
  location?: string;
  is_online: boolean;
}

export interface LeadCreate {
  trainer_id: number;
  request_id: number;
}

export interface LeadResponse {
  id: number;
  trainer_id: number;
  request_id: number;
  attribution_code: string;
  deep_link: string;
  status: string;
  created_at: string;
}

export async function matchTrainer(requestId: number): Promise<TrainerResponse> {
  return apiClient.get<TrainerResponse>(`/trainers/match?request_id=${requestId}`);
}

export async function createLead(data: LeadCreate): Promise<LeadResponse> {
  return apiClient.post<LeadResponse>('/trainers/leads', data);
}
