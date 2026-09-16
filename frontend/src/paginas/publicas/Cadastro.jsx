import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../../servicos/autenticacaoService';
import { formatarCpf } from '../../servicos/formatadores';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();

  function requisitosSenha(valor) {
    const faltam = [];
    if (valor.length < 8) faltam.push('use pelo menos 8 caracteres.');
    if (!/[a-z]/.test(valor)) faltam.push('adicione uma letra minúscula.');
    if (!/[A-Z]/.test(valor)) faltam.push('adicione uma letra maiúscula.');
    if (!/\d/.test(valor)) faltam.push('adicione um número.');
    if (!/[^A-Za-z0-9]/.test(valor)) faltam.push('adicione um símbolo, como @ ou #.');
    return faltam;
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    const faltam = requisitosSenha(senha);
    if (faltam.length) {
      setErro(`Não foi possível se cadastrar. Para sua senha ficar segura, ${faltam.join(' ')}`);
      return;
    }
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
            onChange={(e) => setCpf(formatarCpf(e.target.value))} required maxLength={14}
            placeholder="000.000.000-00"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors" />
          <p className="text-xs text-zinc-400 mt-2">Usado para identificar o comprador no pagamento.</p>
        </div>

        <div className="mb-6">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium">Senha</label>
          <div className="relative"><input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} autoComplete="new-password" className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 pr-20 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/80 transition-colors" /><button type="button" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} className="absolute inset-y-0 right-3 text-xs font-semibold text-[#d4af45] hover:text-[#e2c25d]">{mostrarSenha ? 'Ocultar' : 'Mostrar'}</button></div>
          <p className="mt-2 text-xs text-zinc-400">Use 8 ou mais caracteres, com letra maiúscula, minúscula, número e símbolo (ex.: @ ou #).</p>
          {senha && requisitosSenha(senha).length > 0 && <div role="status" className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200"><strong className="font-semibold text-amber-300">Senha ainda não atende aos requisitos.</strong><span className="block mt-1">{requisitosSenha(senha).join(' ')}</span></div>}
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
