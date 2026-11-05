import { useState } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../componentes/ui/Botao';
import Superficie from '../../componentes/ui/Superficie';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Privacidade() {
  const { usuario, logout } = useAutenticacao();
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function exportar() {
    setErro('');
    const resposta = await fetch(`${API_URL}/meus-dados`);
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
      <div role="status" className={mensagem ? 'text-sucesso mb-4' : ''}>{mensagem}</div>
      <div role="alert" className={erro ? 'text-erro mb-4' : ''}>{erro}</div>
      <Superficie as="section" sombra className="space-y-4 text-texto-secundario">
        <p>Utilizamos seus dados para criar e proteger sua conta, processar pedidos, pagamentos, entregas e prestar atendimento.</p>
        <p>Os dados necessários podem ser compartilhados com os provedores de pagamento, entrega e comunicação envolvidos no pedido. Não vendemos dados pessoais.</p>
        <p>Dados de pedidos podem ser mantidos pelo prazo exigido por obrigações legais, fiscais e de prevenção a fraudes, mesmo após a anonimização da conta.</p>
        <p>Você pode solicitar acesso aos dados da conta ou sua anonimização pelos controles abaixo.</p>
      </Superficie>

      <Superficie as="section" sombra className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Seus direitos</h2>
        {usuario ? (
          <>
            <div className="flex flex-wrap gap-3">
              <Botao variante="secundario" onClick={exportar}>Baixar meus dados</Botao>
              <Botao variante="destrutivo" onClick={anonimizar}>Anonimizar minha conta</Botao>
            </div>
          </>
        ) : (
          <p className="text-texto-secundario"><Link to="/login" className="text-link underline underline-offset-2">Entre na sua conta</Link> para acessar ou anonimizar seus dados.</p>
        )}
      </Superficie>
    </div>
  );
}
