import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';

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

  const conteudo = CONTEUDO[resultado] || CONTEUDO.falha;

  useEffect(() => {
    if (resultado === 'sucesso') {
      limparCarrinho();
    }
  }, [resultado, limparCarrinho]);

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
