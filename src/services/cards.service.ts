const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message ?? 'Erro inesperado');
  }
  return body as T;
}

// ----------------------------------------------------------------------

export type Card = {
  id: string;
  last_numbers: string;
  name: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CreateCardPayload = {
  last_numbers: string;
  name?: string;
};

export type UpdateCardPayload = {
  name?: string | null;
};

// ----------------------------------------------------------------------

export async function getCardsRequest(token: string): Promise<Card[]> {
  const res = await fetch(`${BASE_URL}/cards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: Card[] }>(res);
  return body.data;
}

export async function createCardRequest(token: string, payload: CreateCardPayload): Promise<Card> {
  const res = await fetch(`${BASE_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: Card }>(res);
  return body.data;
}

export async function updateCardRequest(
  token: string,
  id: string,
  payload: UpdateCardPayload
): Promise<Card> {
  const res = await fetch(`${BASE_URL}/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: Card }>(res);
  return body.data;
}

export async function deleteCardRequest(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/cards/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}
