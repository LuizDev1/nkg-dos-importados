import { createContext, useContext, useState, useEffect } from 'react';

const ContextoCarrinho = createContext(null);

export function ProvedorCarrinho({ children }) {
  const [itens, setItens] = useState(() => {
    const salvo = localStorage.getItem('carrinho');
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens));
  }, [itens]);

  function adicionarItem(produto) {
    setItens((atual) => {
      const existente = atual.find((item) => item.produto_id === produto.id);

      if (existente) {
        return atual.map((item) =>
          item.produto_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...atual,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
          foto_url: produto.foto_url,
          quantidade: 1,
        },
      ];
    });
  }

  function removerItem(produtoId) {
    setItens((atual) => atual.filter((item) => item.produto_id !== produtoId));
  }

  function alterarQuantidade(produtoId, quantidade) {
    if (quantidade < 1) return;

    setItens((atual) =>
      atual.map((item) =>
        item.produto_id === produtoId ? { ...item, quantidade } : item
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