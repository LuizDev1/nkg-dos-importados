import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { abandonarPedidoPendente } from '../servicos/pedidoService';

import { buscarProduto } from '../servicos/produtoService';
import { limitarQuantidade, atualizarEstoqueCarrinho } from '../utilitarios/estoqueCarrinho.mjs';

const ContextoCarrinho = createContext(null);

export function ProvedorCarrinho({ children }) {
  const { pathname } = useLocation();
  const [itens, setItens] = useState(() => {
    const salvo = localStorage.getItem('carrinho');
    return salvo
      ? JSON.parse(salvo).map((item) => ({ ...item, chave: item.chave || String(item.produto_id) }))
      : [];
  });

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens));
  }, [itens]);

  const [carregandoEstoque, setCarregandoEstoque] = useState(true);
  const [erroEstoque, setErroEstoque] = useState('');
  const produtosCarrinho = [...new Set(itens.map(item => String(item.produto_id)))].sort().join(',');

  useEffect(() => {
    let ativo = true;
    async function revalidarCarrinho() {
      setCarregandoEstoque(true);
      setErroEstoque('');
      const ids = produtosCarrinho ? produtosCarrinho.split(',') : [];
      try {
        const resultados = await Promise.all(ids.map(async id => [id, await buscarProduto(id)]));
        if (!ativo) return;
        const produtos = new Map(resultados);
        setItens(atuais => atualizarEstoqueCarrinho(atuais, produtos));
      } catch {
        if (ativo) setErroEstoque('Erro ao atualizar estoque. Recarregue a página para tentar novamente.');
      } finally {
        if (ativo) setCarregandoEstoque(false);
      }
    }

    function aoRetornarParaAba() {
      if (document.visibilityState === 'visible') revalidarCarrinho();
    }

    revalidarCarrinho();
    window.addEventListener('focus', revalidarCarrinho);
    document.addEventListener('visibilitychange', aoRetornarParaAba);
    return () => {
      ativo = false;
      window.removeEventListener('focus', revalidarCarrinho);
      document.removeEventListener('visibilitychange', aoRetornarParaAba);
    };
  }, [produtosCarrinho, pathname]);

  function invalidarPedidoPendente() {
    const pedidoId = localStorage.getItem('pedido_pendente_carrinho');
    if (!pedidoId) return;

    abandonarPedidoPendente(pedidoId)
      .then(() => localStorage.removeItem('pedido_pendente_carrinho'))
      .catch((erro) => console.error('Não foi possível cancelar o pedido pendente:', erro));
  }

  function adicionarItem(produto, quantidade = 1, variacao = null) {
    if (produto.ativo === false || Number(produto.ativo) === 0) return;

    const estoque = Number(variacao ? variacao.estoque_qtd : produto.estoque_qtd);
    if (!Number.isInteger(quantidade) || quantidade < 1 || !Number.isFinite(estoque) || estoque < 1) return;
    quantidade = Math.min(quantidade, estoque);
    invalidarPedidoPendente();
    const chaveVariacao = variacao?.id || (variacao?.tamanho ? `tamanho-${variacao.tamanho}` : '');
    const chave = variacao ? `${produto.id}:${chaveVariacao}` : String(produto.id);
    setItens((atual) => {
      const existente = atual.find((item) => item.chave === chave);

      if (existente) {
        return atual.map((item) =>
          item.chave === chave
            ? { ...item, estoque_qtd: estoque, quantidade: Math.min(Number(item.quantidade) + quantidade, estoque) }
            : item
        );
      }

      return [
        ...atual,
        {
          estoque_qtd: estoque,
          produto_id: produto.id,
          variacao_id: variacao?.id || null,
          tamanho: variacao?.tamanho || null,
          variacao_nome: variacao ? [variacao.nome, variacao.tamanho].filter(Boolean).join(' / ') : null,
          chave,
          nome: produto.nome,
          preco: Number(produto.preco),
          foto_url: produto.foto_url,
          quantidade,
        },
      ];
    });
  }

  function removerItem(chave) {
    invalidarPedidoPendente();
    setItens((atual) => atual.filter((item) => item.chave !== chave));
  }

  function alterarQuantidade(chave, quantidade) {
    if (!Number.isInteger(quantidade) || quantidade < 1) return;
    invalidarPedidoPendente();

    setItens((atual) =>
      atual.map((item) =>
        item.chave === chave && limitarQuantidade(quantidade, item.estoque_qtd) !== null
          ? { ...item, quantidade: limitarQuantidade(quantidade, item.estoque_qtd) }
          : item
      )
    );
  }

  const limparCarrinho = useCallback(() => {
    setItens([]);
  }, []);

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const quantidadeTotal = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <ContextoCarrinho.Provider
      value={{ carregandoEstoque, erroEstoque, itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho, total, quantidadeTotal }}
    >
      {children}
    </ContextoCarrinho.Provider>
  );
}

export function useCarrinho() {
  return useContext(ContextoCarrinho);
}

