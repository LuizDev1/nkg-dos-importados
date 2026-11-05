import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import ItemCarrinho from '../../componentes/ItemCarrinho';

function AvisoItensRemovidos({ nomes, aoDispensar }) {
  // Região estável: o leitor de tela anuncia quando os nomes entram.
  return (
    <div role="status" className={nomes.length ? 'mb-6 rounded border border-aviso-borda bg-aviso-fundo p-4 text-sm text-aviso-texto' : ''}>
      {nomes.length > 0 && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p>
            {nomes.length === 1
              ? <>O item <strong>{nomes[0]}</strong> saiu do carrinho porque ficou sem estoque ou indisponível.</>
              : <>Estes itens saíram do carrinho porque ficaram sem estoque ou indisponíveis: <strong>{nomes.join(', ')}</strong>.</>}
          </p>
          <button type="button" onClick={aoDispensar} className="font-semibold underline underline-offset-2">Entendi</button>
        </div>
      )}
    </div>
  );
}

export default function Carrinho() {
  const { itens, removerItem, alterarQuantidade, total, carregandoEstoque, erroEstoque, itensRemovidos, dispensarItensRemovidos } = useCarrinho();
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();
  const itensDisponiveis = itens;

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handleFinalizarCompra() {
    if (!usuario) {
      // Envia o usuário para o login com a instrução de voltar para o checkout
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  }

  // O aviso fica sempre na mesma posição da árvore, para a região viva não ser recriada entre os estados.
  const aviso = <AvisoItensRemovidos nomes={itensRemovidos} aoDispensar={dispensarItensRemovidos} />;

  if (carregandoEstoque) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {aviso}
        <h1 className="sr-only">Meu carrinho</h1>
        <p role="status" className="text-gray-500">Validando produtos do carrinho...</p>
      </div>
    );
  }

  if (itensDisponiveis.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {aviso}
        <h1 className="sr-only">Meu carrinho</h1>
        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
        <Link to="/" className="botao-voltar">
          &larr; Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {aviso}
      <h1 className="text-2xl font-bold mb-6">Meu carrinho</h1>
      {erroEstoque && <p role="alert" className="mb-4 text-erro">{erroEstoque}</p>}
      {itens.some(item => item.estoque_qtd === 0) && <p role="alert">Remova os itens sem estoque para continuar.</p>}
      <div className="space-y-4">
        {itensDisponiveis.map((item) => (
          <ItemCarrinho
            key={item.chave}
            item={item}
            carregandoEstoque={carregandoEstoque || Boolean(erroEstoque)}
            onAlterarQuantidade={alterarQuantidade}
            onRemover={removerItem}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-between items-center gap-3 border-t pt-4">
        <span className="text-lg font-bold">Total: {formatarMoeda(total)}</span>
        <button
          onClick={handleFinalizarCompra}
          disabled={carregandoEstoque || Boolean(erroEstoque) || itensDisponiveis.length === 0 || itensDisponiveis.some(item => !item.estoque_qtd || item.quantidade < 1)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
