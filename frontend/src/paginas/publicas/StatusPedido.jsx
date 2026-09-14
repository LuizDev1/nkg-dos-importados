import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CONTEUDO = {
  sucesso: {
    titulo: 'Pagamento aprovado!',
    mensagem: 'Seu pedido foi confirmado e já está sendo preparado.',
    cor: 'text-green-600',
  },
  pendente: {
    titulo: 'Pagamento em análise',
    mensagem: 'Assim que for confirmado, seu pedido será processado.',
    cor: 'text-yellow-600',
  },
  falha: {
    titulo: 'Pagamento não concluído',
    mensagem: 'Algo deu errado ou a compra foi cancelada. Você pode tentar novamente.',
    cor: 'text-red-600',
  },
};

export default function StatusPedido() {
  const { id, resultado } = useParams();
  const { limparCarrinho } = useCarrinho();
  const { token } = useAutenticacao();
  const sincronizado = useRef(false);

  const conteudo = CONTEUDO[resultado] || CONTEUDO.falha;

  useEffect(() => {
    if (resultado === 'sucesso') {
      limparCarrinho();
    }

    if (resultado === 'sucesso' || resultado === 'falha') {
      const parametros = new URLSearchParams(window.location.search);
      const paymentId = parametros.get('payment_id') || parametros.get('collection_id');
      if (paymentId && token && !sincronizado.current) {
        sincronizado.current = true;
        fetch(`${API_URL}/pagamentos/${id}/sincronizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ payment_id: paymentId }),
        }).catch(() => {});
      }
    }
  }, [resultado, limparCarrinho, id, token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className={`text-2xl font-bold mb-3 ${conteudo.cor}`}>{conteudo.titulo}</h1>
      <p className="text-gray-600 mb-2">{conteudo.mensagem}</p>
      <p className="text-sm text-gray-400 mb-6">Pedido #{id}</p>

      <Link to="/" className="text-blue-600 hover:underline">
        Voltar para a loja
      </Link>
    </div>
  );
}
