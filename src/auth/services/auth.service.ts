import type { User, LoginPayload, RegisterPayload, UpdateProfilePayload } from '../types';

const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message ?? 'Erro inesperado');
  }
  return body as T;
}

type LoginResponse = {
  tokenType: string;
  expiresIn: string;
  accessToken: string;
};

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

export async function registerRequest(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await handleResponse(res);
}

export async function getProfileRequest(token: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: User }>(res);
  return body.data;
}

export async function updateProfileRequest(token: string, payload: UpdateProfilePayload): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: User }>(res);
  return body.data;
}
