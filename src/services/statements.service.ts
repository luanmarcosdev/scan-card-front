import { handleResponse } from './http';

const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

// ----------------------------------------------------------------------

export type Statement = {
  id: string;
  card_id: string;
  status_id: number;
  year_reference: number;
  month_reference: number;
  total: number | null;
  created_at: string;
  updated_at: string | null;
};

export type UpdateStatementPayload = { total?: number | null };

// ----------------------------------------------------------------------

export async function getStatementsRequest(token: string, cardId: string): Promise<Statement[]> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/statements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: Statement[] }>(res);
  return body.data;
}

export async function createStatementRequest(
  token: string,
  cardId: string,
  formData: FormData
): Promise<Statement> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/statements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const body = await handleResponse<{ data: Statement }>(res);
  return body.data;
}

export async function updateStatementRequest(
  token: string,
  cardId: string,
  id: string,
  payload: UpdateStatementPayload
): Promise<Statement> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/statements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: Statement }>(res);
  return body.data;
}

export async function deleteStatementRequest(
  token: string,
  cardId: string,
  id: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/statements/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}
