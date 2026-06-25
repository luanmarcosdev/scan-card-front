import { handleResponse } from './http';

const BASE_URL = 'https://api.luanmarcosdev.com.br/api';

// ----------------------------------------------------------------------

export type AnalyticsCategory = {
  category_id: string;
  category_name: string;
  count: number;
  total: number;
  avg_value: number;
  salary_ratio: number;
  due_ratio: number;
};

export type PurchaseTransaction = {
  transaction_id: string;
  expense_category_id: string;
  expense_category_name: string;
  card_id: string;
  card_last_numbers: string;
  card_name: string | null;
  merchant: string | null;
  transaction_date: string | null;
  parcels: number;
  current_parcel: number;
  parcel_value: number | null;
  total_value: number;
};

export type AnalyticsData = {
  general: {
    salary: number | null;
    total_installments: number;
    total_due: number;
    installments_salary_ratio: number | null;
    statements_count: number;
    statements_needing_review: number;
  };
  transactions: {
    count: number;
    avg_value: number;
    by_category: AnalyticsCategory[];
  };
  purchases: {
    cash: { count: number; total: number };
    installments: { count: number; total: number };
    ends_this_month: { count: number; total: number };
    ends_next_month: { count: number; total: number };
    ends_within_3_months: { count: number; total: number };
  };
};

type AnalyticsParams = {
  month?: number;
  year: number;
  card_id?: string;
};

type AnalyticsTransactionsParams = {
  month?: number;
  year?: number;
  card_id?: string;
  category_id?: string;
  type?: 'cash' | 'installments' | 'ends_this_month' | 'ends_next_month' | 'ends_within_3_months';
};

// ----------------------------------------------------------------------

export async function getAnalyticsRequest(
  token: string,
  params: AnalyticsParams
): Promise<AnalyticsData> {
  const searchParams = new URLSearchParams();
  if (params.month !== undefined) searchParams.set('month', String(params.month));
  searchParams.set('year', String(params.year));
  if (params.card_id) searchParams.set('card_id', params.card_id);

  const res = await fetch(`${BASE_URL}/analytics?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: AnalyticsData }>(res);
  return body.data;
}

export async function getAnalyticsTransactionsRequest(
  token: string,
  params: AnalyticsTransactionsParams
): Promise<PurchaseTransaction[]> {
  const searchParams = new URLSearchParams();
  if (params.month !== undefined) searchParams.set('month', String(params.month));
  if (params.year !== undefined) searchParams.set('year', String(params.year));
  if (params.card_id) searchParams.set('card_id', params.card_id);
  if (params.category_id) searchParams.set('category_id', params.category_id);
  if (params.type) searchParams.set('type', params.type);

  const res = await fetch(`${BASE_URL}/analytics/transactions?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await handleResponse<{ data: PurchaseTransaction[] }>(res);
  return body.data;
}
