import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adicionarFavorito, listarFavoritos, removerFavorito } from '../servicos/favoritoService';
import { useAutenticacao } from './ContextoAutenticacao';

const ContextoFavoritos = createContext(null);

export function ProvedorFavoritos({ children }) {
  const { usuario } = useAutenticacao();
  const [produtos, setProdutos] = useState([]);
  // 'ocioso' (sem cliente logado), 'carregando', 'pronto' ou 'erro': a tela não confunde carregamento ou falha com lista vazia.
  const [estado, setEstado] = useState('ocioso');

  const carregar = useCallback(() => {
    if (!usuario || usuario.perfil === 'admin') {
      setProdutos([]);
      setEstado('ocioso');
      return;
    }
    setEstado('carregando');
    listarFavoritos()
      .then((lista) => { setProdutos(lista); setEstado('pronto'); })
      .catch(() => { setProdutos([]); setEstado('erro'); });
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  function estaFavorito(produtoId) {
    return produtos.some((produto) => String(produto.id) === String(produtoId));
  }

  async function alternarFavorito(produto) {
    if (estaFavorito(produto.id)) {
      await removerFavorito(produto.id);
      setProdutos((atuais) => atuais.filter((item) => String(item.id) !== String(produto.id)));
    } else {
      if (produto.ativo === false || Number(produto.ativo) === 0) return;
      await adicionarFavorito(produto.id);
      setProdutos((atuais) => [produto, ...atuais]);
    }
  }

  return (
    <ContextoFavoritos.Provider value={{ produtos, estado, recarregar: carregar, estaFavorito, alternarFavorito }}>
      {children}
    </ContextoFavoritos.Provider>
  );
}

export function useFavoritos() {
  return useContext(ContextoFavoritos);
}
