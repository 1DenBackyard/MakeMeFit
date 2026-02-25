/** Authentication API. */
import { apiClient } from './client';

export interface TelegramUser {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: TelegramUser;
}

export async function authTelegram(initData: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/telegram', {
    init_data: initData,
  });
  apiClient.setToken(response.token);
  return response;
}
