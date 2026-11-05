import { useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import Turnstile, { turnstileAtivo } from '../../componentes/Turnstile';

const ROTULO = 'block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium';
const CAMPO = 'w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-base sm:text-sm focus:outline-none focus:border-amber-500/80 transition-colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const campoEmail = useRef(null);
  const { login } = useAutenticacao();
  const navegar = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const dados = await login(email, senha, turnstileToken);

      if (dados.usuario.perfil === 'admin') {
        navegar('/admin', { replace: true });
      } else {
        navegar(from, { replace: true });
      }
    } catch (erro) {
      setErro(erro.message);
      campoEmail.current?.focus();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page min-h-[calc(100dvh-73px)] flex items-center justify-center px-4 py-12">
      <form
        onSubmit={aoEnviar}
        className="auth-card w-full max-w-md rounded-lg border border-[#343024] bg-[#111210]/95 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h1 className="mt-4 text-4xl font-black tracking-[0.2em] text-[#d4af45]"><span className="sr-only">Entrar na </span>NKG</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-[#f4efe5]">Dos Importados</p>
        </div>

        {/* Região estável: existe vazia antes do erro para o leitor de tela anunciar a falha. */}
        <div role="alert" id="login-erro" className={erro ? 'bg-erro-fundo border border-erro-borda text-[#fca5a5] text-sm p-3 rounded-lg mb-6 text-center' : ''}>
          {erro}
        </div>

        <div className="mb-4">
          <label htmlFor="login-email" className={ROTULO}>E-mail</label>
          <input
            ref={campoEmail}
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={erro ? 'true' : undefined}
            aria-describedby={erro ? 'login-erro' : undefined}
            className={CAMPO}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="login-senha" className={ROTULO}>Senha</label>
          <div className="relative">
            <input
              id="login-senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={erro ? 'true' : undefined}
              aria-describedby={erro ? 'login-erro' : undefined}
              className={`${CAMPO} pr-20`}
            />
            <button type="button" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} aria-controls="login-senha" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute inset-y-0 right-3 text-xs font-semibold text-[#d4af45] hover:text-[#e2c25d]">
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <Turnstile acao="login" aoValidar={setTurnstileToken} />

        <button
          type="submit"
          disabled={carregando || (turnstileAtivo() && !turnstileToken)}
          className="w-full rounded bg-[#d4af45] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-[#090a09] shadow-lg shadow-black/30 transition-all hover:bg-[#e2c25d] disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-xs text-center mt-6 text-zinc-400 tracking-wider">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-[#d4af45] underline underline-offset-4 hover:text-[#e2c25d]">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
