import { createContext, useContext, useState, useEffect } from 'react';
import { abandonarPedidoPendente } from '../servicos/pedidoService';

const ContextoCarrinho = createContext(null);

export function ProvedorCarrinho({ children }) {
  const [itens, setItens] = useState(() => {
    const salvo = localStorage.getItem('carrinho');
    return salvo
      ? JSON.parse(salvo).map((item) => ({ ...item, chave: item.chave || String(item.produto_id) }))
      : [];
  });

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens));
  }, [itens]);

  function invalidarPedidoPendente() {
    const pedidoId = localStorage.getItem('pedido_pendente_carrinho');
    if (!pedidoId) return;

    abandonarPedidoPendente(pedidoId)
      .then(() => localStorage.removeItem('pedido_pendente_carrinho'))
      .catch((erro) => console.error('Não foi possível cancelar o pedido pendente:', erro));
  }

  function adicionarItem(produto, quantidade = 1, variacao = null) {
    invalidarPedidoPendente();
    const chave = variacao ? `${produto.id}:${variacao.id}` : String(produto.id);
    setItens((atual) => {
      const existente = atual.find((item) => item.chave === chave);

      if (existente) {
        return atual.map((item) =>
          item.chave === chave
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }

      return [
        ...atual,
        {
          produto_id: produto.id,
          variacao_id: variacao?.id || null,
          variacao_nome: variacao?.nome || null,
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
    if (quantidade < 1) return;
    invalidarPedidoPendente();

    setItens((atual) =>
      atual.map((item) =>
        item.chave === chave ? { ...item, quantidade } : item
      )
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const quantidadeTotal = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <ContextoCarrinho.Provider
      value={{ itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho, total, quantidadeTotal }}
    >
      {children}
    </ContextoCarrinho.Provider>
  );
}

export function useCarrinho() {
  return useContext(ContextoCarrinho);
}

