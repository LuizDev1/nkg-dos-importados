import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginServico, logout as logoutServico, registrar as registrarServico } from '../servicos/autenticacaoService';
import { limparCsrf } from '../servicos/apiSegura';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [sessaoEncerrada, setSessaoEncerrada] = useState(false);

  useEffect(() => {
    let ativo = true;

    fetch(`${import.meta.env.VITE_API_URL || '/api'}/usuarios/me`).then(async (resposta) => {
        if (!ativo) return;
        if (!resposta.ok) throw new Error('Sessão inválida');
        const dados = await resposta.json();
        setUsuario(dados);
      }).catch(() => {
        if (!ativo) return;
        setUsuario(null);
      }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  async function login(email, senha, turnstileToken) {
    const dados = await loginServico(email, senha, turnstileToken);
    setSessaoEncerrada(false);

    setUsuario(dados.usuario);

    return dados;
  }

  async function registrar(dadosUsuario) {
    return await registrarServico(dadosUsuario);
  }

  async function logout() {
    try { await logoutServico(); } catch { /* A interface ainda encerra a sessão local. */ }
    setSessaoEncerrada(true);
    setUsuario(null);
    limparCsrf();
  }

  function atualizarUsuario(dados) {
    const atualizado = { ...usuario, nome: dados.nome, email: dados.email };
    setUsuario(atualizado);
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, carregando, login, registrar, logout, atualizarUsuario, sessaoEncerrada }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}
