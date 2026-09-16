const API_URL = import.meta.env.VITE_API_URL || '/api';
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` }; }
async function ler(resposta) { const resultado = await resposta; const dados = await resultado.json(); if (!resultado.ok) throw new Error(dados.mensagem || 'Erro ao salvar endereço'); return dados; }
export const listarEnderecos = () => ler(fetch(`${API_URL}/usuarios/me/enderecos`, { headers: headers() }));
export const criarEndereco = (dados) => ler(fetch(`${API_URL}/usuarios/me/enderecos`, { method: 'POST', headers: headers(), body: JSON.stringify(dados) }));
export const removerEndereco = (id) => ler(fetch(`${API_URL}/usuarios/me/enderecos/${id}`, { method: 'DELETE', headers: headers() }));
export const definirEnderecoPrincipal = (id) => ler(fetch(`${API_URL}/usuarios/me/enderecos/${id}/principal`, { method: 'PATCH', headers: headers() }));
