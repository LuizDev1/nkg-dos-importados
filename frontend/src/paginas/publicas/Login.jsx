import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAutenticacao();
  const navegar = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const dados = await login(email, senha);
      
      if (dados.usuario.perfil === 'admin') {
        navegar('/admin', { replace: true });
      } else {
        navegar(from, { replace: true });
      }
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page min-h-[calc(100dvh-73px)] flex items-center justify-center px-4 py-12">
      <form
        onSubmit={aoEnviar}
        className="auth-card w-full max-w-md rounded-lg border border-[#343024] bg-[#111210]/95 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h1 className="mt-4 text-4xl font-black tracking-[0.2em] text-[#d4af45]">NKG</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-[#f4efe5]">Dos Importados</p>
        </div>

        {erro && (
          <div className="bg-red-950/60 border border-red-900/50 text-red-200 text-xs p-3 rounded-lg mb-6 text-center">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">Senha</label>
          <div className="relative"><input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 pr-20 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors" /><button type="button" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} className="absolute inset-y-0 right-3 text-xs font-semibold text-[#d4af45] hover:text-[#e2c25d]">{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button></div>
        </div>

        <button
          type="submit"
          disabled={carregando}
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
