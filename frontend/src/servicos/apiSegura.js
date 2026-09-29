const API_URL = import.meta.env.VITE_API_URL || '/api';
const fetchOriginal = globalThis.fetch.bind(globalThis);

function urlDaApi(entrada) {
  const url = typeof entrada === 'string' ? entrada : entrada?.url;
  if (!url) return false;
  if (API_URL.startsWith('http')) return url.startsWith(API_URL);
  return new URL(url, window.location.origin).pathname.startsWith(API_URL);
}

export function configurarFetchSeguro() {
  globalThis.fetch = async (entrada, opcoes = {}) => {
    if (!urlDaApi(entrada)) return fetchOriginal(entrada, opcoes);

    const metodo = String(opcoes.method || (typeof entrada !== 'string' && entrada.method) || 'GET').toUpperCase();
    const headers = new Headers(opcoes.headers || (typeof entrada !== 'string' ? entrada.headers : undefined));
    headers.delete('Authorization');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(metodo)) {
      const csrf = sessionStorage.getItem('csrf_token');
      if (csrf) headers.set('X-CSRF-Token', csrf);
    }

    const resposta = await fetchOriginal(entrada, { ...opcoes, headers, credentials: 'include' });
    const csrfRecebido = resposta.headers.get('X-CSRF-Token');
    if (csrfRecebido) sessionStorage.setItem('csrf_token', csrfRecebido);
    return resposta;
  };
}

export function limparCsrf() {
  sessionStorage.removeItem('csrf_token');
}
