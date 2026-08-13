import { request } from '@playwright/test';

export const API_BASE_URL = 'http://localhost:8081/api/v1';

export async function loginViaApi(email: string, password: string): Promise<string> {
  const reqContext = await request.newContext();
  const response = await reqContext.post(`${API_BASE_URL}/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`API Login failed for ${email}: ${response.status()} ${text}`);
  }

  const json = await response.json();
  const data = json.data || json;
  return data.token;
}

export async function getAuthHeader(email: string, password: string) {
  const token = await loginViaApi(email, password);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
