import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../../servicos/autenticacaoService';
import { formatarCpf } from '../../servicos/formatadores';
import Turnstile, { turnstileAtivo } from '../../componentes/Turnstile';

const ROTULO = 'block text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2 font-medium';
const CAMPO = 'w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-base sm:text-sm focus:outline-none focus:border-amber-500/80 transition-colors';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const campoNome = useRef(null);
  const campoSenha = useRef(null);
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
    setErroSenha('');

    const faltam = requisitosSenha(senha);
    if (faltam.length) {
      setErroSenha(`Para sua senha ficar segura, ${faltam.join(' ')}`);
      campoSenha.current?.focus();
      return;
    }

    setCarregando(true);

    try {
      await registrar({ nome, email, senha, cpf, turnstile_token: turnstileToken });
      setSucesso(true);
      setTimeout(() => navegar('/login'), 1500);
    } catch (erro) {
      setErro(erro.message);
      campoNome.current?.focus();
    } finally {
      setCarregando(false);
    }
  }

  const pendencias = senha ? requisitosSenha(senha) : [];

  return (
    <div className="auth-page min-h-[calc(100dvh-73px)] flex items-center justify-center px-4 py-12">
      <form
        onSubmit={aoEnviar}
        className="auth-card w-full max-w-md rounded-lg border border-[#343024] bg-[#111210]/95 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h1 className="mt-4 text-3xl font-black tracking-[0.12em] text-[#f4efe5]">Criar conta</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-[#d4af45]">NKG Dos Importados</p>
        </div>

        {/* Regiões estáveis: existem vazias antes de receber a mensagem. */}
        <div role="alert" id="cadastro-erro" className={erro ? 'bg-erro-fundo border border-erro-borda text-[#fca5a5] text-sm p-3 rounded-lg mb-6 text-center' : ''}>
          {erro}
        </div>
        <div role="status" className={sucesso ? 'bg-sucesso-fundo border border-sucesso-borda text-sucesso-texto text-sm p-3 rounded-lg mb-6 text-center' : ''}>
          {sucesso ? 'Cadastro feito! Redirecionando para o login...' : ''}
        </div>

        <div className="mb-4">
          <label htmlFor="cadastro-nome" className={ROTULO}>Nome</label>
          <input
            ref={campoNome}
            id="cadastro-nome"
            name="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            aria-describedby={erro ? 'cadastro-erro' : undefined}
            className={CAMPO}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cadastro-email" className={ROTULO}>E-mail</label>
          <input
            id="cadastro-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={CAMPO}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cpf" className={ROTULO}>CPF</label>
          <input id="cpf" name="cpf" type="text" inputMode="numeric" autoComplete="off" value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))} required maxLength={14}
            placeholder="000.000.000-00" aria-describedby="cpf-ajuda"
            className={CAMPO} />
          <p id="cpf-ajuda" className="text-xs text-zinc-400 mt-2">Usado para identificar o comprador no pagamento.</p>
        </div>

        <div className="mb-6">
          <label htmlFor="cadastro-senha" className={ROTULO}>Senha</label>
          <div className="relative">
            <input
              ref={campoSenha}
              id="cadastro-senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(''); }}
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={erroSenha ? 'true' : undefined}
              aria-describedby={`senha-ajuda senha-pendencias${erroSenha ? ' senha-erro' : ''}`}
              className={`${CAMPO} pr-20`}
            />
            <button type="button" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} aria-controls="cadastro-senha" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute inset-y-0 right-3 text-xs font-semibold text-[#d4af45] hover:text-[#e2c25d]">
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <p id="senha-ajuda" className="mt-2 text-xs text-zinc-400">Use 8 ou mais caracteres, com letra maiúscula, minúscula, número e símbolo (ex.: @ ou #).</p>
          {erroSenha && <p id="senha-erro" className="mt-2 text-sm text-erro">{erroSenha}</p>}
          <div id="senha-pendencias" role="status" className={!erroSenha && pendencias.length ? 'mt-3 rounded-md border border-aviso-borda bg-aviso-fundo px-3 py-2 text-xs leading-relaxed text-aviso-texto' : ''}>
            {!erroSenha && pendencias.length > 0 && (
              <>
                <strong className="font-semibold">Senha ainda não atende aos requisitos.</strong>
                <span className="block mt-1">{pendencias.join(' ')}</span>
              </>
            )}
          </div>
        </div>

        <Turnstile acao="cadastro" aoValidar={setTurnstileToken} />

        <button
          type="submit"
          disabled={carregando || (turnstileAtivo() && !turnstileToken)}
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
