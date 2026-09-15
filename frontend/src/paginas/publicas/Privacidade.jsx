import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Privacidade() {
  const { usuario, logout } = useAutenticacao();
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Privacidade e dados pessoais</h1>
      {mensagem && <p className="text-green-600 mb-4">{mensagem}</p>}
      {erro && <p className="text-red-600 mb-4">{erro}</p>}
      <section className="bg-white rounded-lg shadow p-5 space-y-4 text-gray-700">
        <p>Utilizamos seus dados para criar e proteger sua conta, processar pedidos, pagamentos, entregas e prestar atendimento.</p>
        <p>Os dados necessários podem ser compartilhados com os provedores de pagamento, entrega e comunicação envolvidos no pedido. Não vendemos dados pessoais.</p>
        <p>Dados de pedidos podem ser mantidos pelo prazo exigido por obrigações legais, fiscais e de prevenção a fraudes, mesmo após a anonimização da conta.</p>
        <p>Você pode solicitar acesso aos dados da conta ou sua anonimização pelos controles abaixo.</p>
      </section>

      <section className="mt-6 bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">Seus direitos</h2>
        {usuario ? (
          <>
            <button type="button" onClick={exportar} className="block text-blue-600 hover:underline">Baixar meus dados</button>
            <button type="button" onClick={anonimizar} className="block text-red-600 hover:underline">Anonimizar minha conta</button>
          </>
        ) : (
          <p className="text-gray-600"><Link to="/login" className="text-blue-600 hover:underline">Entre na sua conta</Link> para acessar ou anonimizar seus dados.</p>
        )}
      </section>
    </div>
  );
}
