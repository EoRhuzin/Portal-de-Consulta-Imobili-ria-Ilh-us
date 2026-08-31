export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) {
      if (res.status === 413) {
        throw new Error('O arquivo enviado é muito grande (limite de 50MB excedido).');
      }
      throw new Error(`Erro no servidor (${res.status}).`);
    }
    throw new Error(`Resposta do servidor em formato inválido (${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Erro na requisição (${res.status}).`);
  }

  return data as T;
}
