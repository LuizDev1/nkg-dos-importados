import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../../servicos/autenticacaoService';
import { formatarCpf } from '../../servicos/formatadores.mjs';
import Turnstile, { turnstileAtivo } from '../../componentes/Turnstile';
import Botao from '../../componentes/ui/Botao';
import Campo from '../../componentes/ui/Campo';

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
        className="auth-card w-full max-w-md rounded-painel border border-borda bg-superficie/95 p-6 sm:p-8 shadow-nivel-4 backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h1 className="mt-4 text-3xl font-black tracking-[0.12em] text-texto">Criar conta</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-marca-texto">NKG Dos Importados</p>
        </div>

        {/* Regiões estáveis: existem vazias antes de receber a mensagem. */}
        <div role="alert" id="cadastro-erro" className={erro ? 'bg-erro-fundo border border-erro-borda text-erro-texto text-sm p-3 rounded-cartao mb-6 text-center' : ''}>
          {erro}
        </div>
        <div role="status" className={sucesso ? 'bg-sucesso-fundo border border-sucesso-borda text-sucesso-texto text-sm p-3 rounded-cartao mb-6 text-center' : ''}>
          {sucesso ? 'Cadastro feito! Redirecionando para o login...' : ''}
        </div>

        <Campo
          ref={campoNome}
          id="cadastro-nome"
          rotulo="Nome"
          name="nome"
          type="text"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          aria-describedby={erro ? 'cadastro-erro' : undefined}
          className="mb-4"
        />

        <Campo
          id="cadastro-email"
          rotulo="E-mail"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4"
        />

        <Campo
          id="cpf"
          rotulo="CPF"
          name="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cpf}
          onChange={(e) => setCpf(formatarCpf(e.target.value))}
          required
          maxLength={14}
          placeholder="000.000.000-00"
          ajuda="Usado para identificar o comprador no pagamento."
          className="mb-4"
        />

        <div className="mb-6">
          <Campo
            ref={campoSenha}
            id="cadastro-senha"
            rotulo="Senha"
            name="senha"
            type={mostrarSenha ? 'text' : 'password'}
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErroSenha(''); }}
            required
            minLength={8}
            autoComplete="new-password"
            ajuda="Use 8 ou mais caracteres, com letra maiúscula, minúscula, número e símbolo (ex.: @ ou #)."
            erro={erroSenha}
            aria-describedby="senha-pendencias"
            sufixo={(
              <Botao variante="discreto" tamanho="sm" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} aria-controls="cadastro-senha" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </Botao>
            )}
          />
          <div id="senha-pendencias" role="status" className={!erroSenha && pendencias.length ? 'mt-3 rounded-cartao border border-aviso-borda bg-aviso-fundo px-3 py-2 text-xs leading-relaxed text-aviso-texto' : ''}>
            {!erroSenha && pendencias.length > 0 && (
              <>
                <strong className="font-semibold">Senha ainda não atende aos requisitos.</strong>
                <span className="block mt-1">{pendencias.join(' ')}</span>
              </>
            )}
          </div>
        </div>

        <Turnstile acao="cadastro" aoValidar={setTurnstileToken} />

        <Botao type="submit" tamanho="lg" larguraTotal carregando={carregando} disabled={turnstileAtivo() && !turnstileToken}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </Botao>

        <p className="text-xs text-center mt-6 text-texto-secundario tracking-wider">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-link underline underline-offset-4 hover:text-marca-clara">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
