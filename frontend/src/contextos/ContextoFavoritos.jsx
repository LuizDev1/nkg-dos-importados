import { createContext, useContext, useEffect, useState } from 'react';
import { adicionarFavorito, listarFavoritos, removerFavorito } from '../servicos/favoritoService';
import { useAutenticacao } from './ContextoAutenticacao';

const ContextoFavoritos = createContext(null);

export function ProvedorFavoritos({ children }) {
  const { usuario } = useAutenticacao();
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (!usuario || usuario.perfil === 'admin') {
      setProdutos([]);
      return;
    }
    listarFavoritos().then(setProdutos).catch(() => setProdutos([]));
  }, [usuario]);

  function estaFavorito(produtoId) {
    return produtos.some((produto) => String(produto.id) === String(produtoId));
  }

  async function alternarFavorito(produto) {
    if (estaFavorito(produto.id)) {
      await removerFavorito(produto.id);
      setProdutos((atuais) => atuais.filter((item) => String(item.id) !== String(produto.id)));
    } else {
      await adicionarFavorito(produto.id);
      setProdutos((atuais) => [produto, ...atuais]);
    }
  }

  return (
    <ContextoFavoritos.Provider value={{ produtos, estaFavorito, alternarFavorito }}>
      {children}
    </ContextoFavoritos.Provider>
  );
}

export function useFavoritos() {
  return useContext(ContextoFavoritos);
}
