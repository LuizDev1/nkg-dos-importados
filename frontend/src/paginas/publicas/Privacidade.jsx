import { useState } from 'react';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Privacidade() {
  const { logout } = useAutenticacao();
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function exportar() {
    setErro('');
    const resposta = await fetch(`${API_URL}/meus-dados`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!resposta.ok) {
      setErro('Não foi possível exportar seus dados.');
      return;
    }
    const blob = new Blob([JSON.stringify(await resposta.json(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'meus-dados-nkg.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function anonimizar() {
    if (!window.confirm('Essa ação remove seus dados pessoais e não pode ser desfeita. Continuar?')) return;
    setErro('');
    const resposta = await fetch(`${API_URL}/meus-dados`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.mensagem || 'Não foi possível anonimizar a conta.');
      return;
    }
    setMensagem(dados.mensagem);
    logout();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Privacidade e meus dados</h1>
      {mensagem && <p className="text-green-600 mb-4">{mensagem}</p>}
      {erro && <p className="text-red-600 mb-4">{erro}</p>}
      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <p className="text-gray-600">Você pode baixar os dados associados à sua conta ou anonimizar seus dados pessoais.</p>
        <button type="button" onClick={exportar} className="block text-blue-600 hover:underline">Baixar meus dados</button>
        <button type="button" onClick={anonimizar} className="block text-red-600 hover:underline">Anonimizar minha conta</button>
      </div>
    </div>
  );
}
