import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import ItemCarrinho from '../../componentes/ItemCarrinho';
import { buscarProduto } from '../../servicos/produtoService';

export default function Carrinho() {
  const { itens, removerItem, alterarQuantidade, total, carregandoEstoque, erroEstoque } = useCarrinho();
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();
  const [validandoProdutos, setValidandoProdutos] = useState(true);
  const [produtosInativos, setProdutosInativos] = useState(new Set());
  const idsProdutos = useMemo(
    () => [...new Set(itens.map((item) => String(item.produto_id)))].sort().join(','),
    [itens]
  );

  useEffect(() => {
    let ativo = true;
    const ids = idsProdutos ? idsProdutos.split(',') : [];
    setValidandoProdutos(true);

    Promise.all(ids.map(async (id) => ({ id, produto: await buscarProduto(id) })))
      .then((resultados) => {
        if (!ativo) return;
        const inativos = new Set(
          resultados
            .filter(({ produto }) => produto.ativo === false || Number(produto.ativo) === 0)
            .map(({ id }) => id)
        );
        setProdutosInativos(inativos);
        itens.forEach((item) => {
          if (inativos.has(String(item.produto_id))) removerItem(item.chave);
        });
      })
      .catch(() => {
        if (ativo) setProdutosInativos(new Set(ids));
      })
      .finally(() => {
        if (ativo) setValidandoProdutos(false);
      });

    return () => { ativo = false; };
  }, [idsProdutos]);

  const itensDisponiveis = itens.filter((item) => !produtosInativos.has(String(item.produto_id)));

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

  if (validandoProdutos) {
    return <p role="status" className="py-16 text-center text-gray-500">Validando produtos do carrinho...</p>;
  }

  if (itensDisponiveis.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
        <Link to="/" className="botao-voltar">
          &larr; Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meu carrinho</h1>
      {carregandoEstoque && <p role="status">Atualizando estoque...</p>}
      {erroEstoque && <p role="alert" className="text-red-600">{erroEstoque}</p>}
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
      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <span className="text-lg font-bold">Total: {formatarMoeda(total)}</span>
        <button
          onClick={handleFinalizarCompra}
          disabled={validandoProdutos || carregandoEstoque || Boolean(erroEstoque) || itensDisponiveis.length === 0 || itensDisponiveis.some(item => !item.estoque_qtd || item.quantidade < 1)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
