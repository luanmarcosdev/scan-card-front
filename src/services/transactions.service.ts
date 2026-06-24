const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message ?? 'Erro inesperado');
  }
  return body as T;
}

// ----------------------------------------------------------------------

export type Transaction = {
  id: string;
  card_statement_id: string;
  expense_category_id: string;
  merchant: string | null;
  transaction_date: string | null;
  parcels: number;
  current_parcel: number;
  parcel_value: number | null;
  total_value: number;
  created_at: string;
  updated_at: string | null;
};

export type TransactionPayload = {
  expense_category_id: string;
  total_value: number;
  merchant?: string;
  transaction_date?: string;
  parcels?: number;
  current_parcel?: number;
  parcel_value?: number;
};

// ----------------------------------------------------------------------

export async function getTransactionsRequest(
  token: string,
  cardId: string,
  statementId: string
): Promise<Transaction[]> {
  const res = await fetch(
    `${BASE_URL}/cards/${cardId}/statements/${statementId}/transactions`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const body = await handleResponse<{ data: Transaction[] }>(res);
  return body.data;
}

export async function createTransactionRequest(
  token: string,
  cardId: string,
  statementId: string,
  payload: TransactionPayload
): Promise<Transaction> {
  const res = await fetch(
    `${BASE_URL}/cards/${cardId}/statements/${statementId}/transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
  const body = await handleResponse<{ data: Transaction }>(res);
  return body.data;
}

export async function updateTransactionRequest(
  token: string,
  cardId: string,
  statementId: string,
  id: string,
  payload: Partial<TransactionPayload>
): Promise<Transaction> {
  const res = await fetch(
    `${BASE_URL}/cards/${cardId}/statements/${statementId}/transactions/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
  const body = await handleResponse<{ data: Transaction }>(res);
  return body.data;
}

export async function deleteTransactionRequest(
  token: string,
  cardId: string,
  statementId: string,
  id: string
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/cards/${cardId}/statements/${statementId}/transactions/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  await handleResponse(res);
}
