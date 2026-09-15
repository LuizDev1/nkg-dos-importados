const API_URL = import.meta.env.VITE_API_URL || '/api';

async function requisitar(caminho, dados) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: dados ? 'PATCH' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    ...(dados ? { body: JSON.stringify(dados) } : {}),
  });
  const resultado = await resposta.json();
  if (!resposta.ok) throw new Error(resultado.mensagem || 'Erro ao acessar conta');
  return resultado;
}

export const buscarMinhaConta = () => requisitar('/usuarios/me');
export const salvarMinhaConta = (dados) => requisitar('/usuarios/me', dados);
export const salvarContaCliente = (id, dados) => requisitar(`/usuarios/${id}/dados`, dados);
