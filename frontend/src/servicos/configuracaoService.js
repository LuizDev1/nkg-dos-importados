const API_URL = import.meta.env.VITE_API_URL || '/api';
let configuracoesEmCache = null;
let requisicaoConfiguracoes = null;

export async function buscarConfiguracoes() {
  if (configuracoesEmCache) return configuracoesEmCache;
  if (requisicaoConfiguracoes) return requisicaoConfiguracoes;

  requisicaoConfiguracoes = fetch(`${API_URL}/configuracoes-loja`)
    .then(async (resposta) => {
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem);
      configuracoesEmCache = dados;
      return dados;
    })
    .finally(() => {
      requisicaoConfiguracoes = null;
    });

  return requisicaoConfiguracoes;
}

export async function atualizarConfiguracoes(configuracoes) {
  const token = localStorage.getItem('token');

  const resposta = await fetch(`${API_URL}/configuracoes-loja`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configuracoes),
  });

  const dados = await resposta.json();

  if (!resposta.ok) throw new Error(dados.mensagem);
  configuracoesEmCache = dados;
  return dados;
}
