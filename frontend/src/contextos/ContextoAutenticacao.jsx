import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginServico, registrar as registrarServico } from '../servicos/autenticacaoService';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [sessaoEncerrada, setSessaoEncerrada] = useState(false);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');
    let ativo = true;

    if (tokenSalvo && usuarioSalvo) {
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/usuarios/me`, {
        headers: { Authorization: `Bearer ${tokenSalvo}` },
      }).then(async (resposta) => {
        if (!ativo) return;
        if (!resposta.ok) throw new Error('Sessão inválida');
        const dados = await resposta.json();
        setToken(tokenSalvo);
        setUsuario(dados);
        localStorage.setItem('usuario', JSON.stringify(dados));
      }).catch(() => {
        if (!ativo) return;
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setSessaoEncerrada(true);
      }).finally(() => { if (ativo) setCarregando(false); });
    } else {
      setCarregando(false);
    }
    return () => { ativo = false; };
  }, []);

  async function login(email, senha) {
    const dados = await loginServico(email, senha);
    setSessaoEncerrada(false);

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
    setSessaoEncerrada(true);
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  function atualizarUsuario(dados) {
    const atualizado = { ...usuario, nome: dados.nome, email: dados.email };
    setUsuario(atualizado);
    localStorage.setItem('usuario', JSON.stringify(atualizado));
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, token, carregando, login, registrar, logout, atualizarUsuario, sessaoEncerrada }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}
