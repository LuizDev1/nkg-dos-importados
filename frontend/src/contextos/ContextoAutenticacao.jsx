import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginServico, registrar as registrarServico } from '../servicos/autenticacaoService';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);

  async function login(email, senha) {
    const dados = await loginServico(email, senha);

    setToken(dados.token);
    setUsuario(dados.usuario);

    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));

    return dados;
  }

  async function registrar(dadosUsuario) {
    return await registrarServico(dadosUsuario);
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, token, carregando, login, registrar, logout }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}