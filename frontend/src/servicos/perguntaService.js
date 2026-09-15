const API_URL = import.meta.env.VITE_API_URL || '/api';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
async function ler(resposta) { const resultado = await resposta; const dados = await resultado.json(); if (!resultado.ok) throw new Error(dados.mensagem || 'Erro ao acessar perguntas'); return dados; }
export const listarPerguntas = (produtoId) => ler(fetch(`${API_URL}/produtos/${produtoId}/perguntas`));
export const responderPergunta = (id, resposta) => ler(fetch(`${API_URL}/perguntas/${id}/resposta`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ resposta }) }));
