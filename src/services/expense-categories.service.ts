const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message ?? 'Erro inesperado');
  }
  return body as T;
}

// ----------------------------------------------------------------------

export type ExpenseCategory = {
  id: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CategoryPayload = { category: string; description?: string };

// ----------------------------------------------------------------------

export async function getExpenseCategoriesRequest(token: string): Promise<ExpenseCategory[]> {
  const res = await fetch(`${BASE_URL}/expense-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: ExpenseCategory[] }>(res);
  return body.data;
}

export async function createExpenseCategoryRequest(
  token: string,
  payload: CategoryPayload
): Promise<ExpenseCategory> {
  const res = await fetch(`${BASE_URL}/expense-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: ExpenseCategory }>(res);
  return body.data;
}

export async function updateExpenseCategoryRequest(
  token: string,
  id: string,
  payload: CategoryPayload
): Promise<ExpenseCategory> {
  const res = await fetch(`${BASE_URL}/expense-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse<{ data: ExpenseCategory }>(res);
  return body.data;
}

export async function deleteExpenseCategoryRequest(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/expense-categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}
