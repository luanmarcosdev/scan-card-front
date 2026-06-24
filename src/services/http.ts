export async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Sessão expirada');
  }
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message ?? 'Erro inesperado');
  }
  return body as T;
}
