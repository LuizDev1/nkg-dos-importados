import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../../servicos/autenticacaoService';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await registrar({ nome, email, senha, cpf });
      setSucesso(true);
      setTimeout(() => navegar('/login'), 1500);
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
          <h1 className="mt-4 text-3xl font-black tracking-[0.12em] text-[#f4efe5]">Criar conta</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-[#d4af45]">NKG Dos Importados</p>
        </div>

        {erro && (
          <div className="bg-red-950/60 border border-red-900/50 text-red-200 text-xs p-3 rounded-lg mb-6 text-center">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-emerald-950/60 border border-emerald-900/50 text-emerald-200 text-xs p-3 rounded-lg mb-6 text-center">
            Cadastro feito! Redirecionando para o login...
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

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

        <div className="mb-4">
          <label htmlFor="cpf" className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">CPF</label>
          <input id="cpf" type="text" inputMode="numeric" value={cpf}
            onChange={(e) => setCpf(e.target.value)} required maxLength={14}
            placeholder="000.000.000-00"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors" />
          <p className="text-xs text-zinc-400 mt-2">Usado para identificar o comprador no pagamento.</p>
        </div>

        <div className="mb-6">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded bg-[#d4af45] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-[#090a09] shadow-lg shadow-black/30 transition-all hover:bg-[#e2c25d] disabled:opacity-50"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-xs text-center mt-6 text-zinc-400 tracking-wider">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-[#d4af45] underline underline-offset-4 hover:text-[#e2c25d]">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
