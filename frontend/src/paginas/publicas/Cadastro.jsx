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
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-[#0d0d0d] to-black px-4">
      <form
        onSubmit={aoEnviar}
        className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-[0.2em] text-zinc-100 mt-4">Criar Conta</h1>
          <p className="text-xs tracking-[0.3em] text-amber-500/80 font-medium uppercase mt-1">NKG Dos Importados</p>
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
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 px-4 rounded-lg tracking-[0.15em] text-xs uppercase transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-xs text-center mt-6 text-zinc-400 tracking-wider">
          Já tem conta?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
