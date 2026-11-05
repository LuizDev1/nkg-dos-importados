import { useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import Turnstile, { turnstileAtivo } from '../../componentes/Turnstile';
import Botao from '../../componentes/ui/Botao';
import Campo from '../../componentes/ui/Campo';

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
        className="auth-card w-full max-w-md rounded-painel border border-borda bg-superficie/95 p-6 sm:p-8 shadow-nivel-4 backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h1 className="mt-4 text-4xl font-black tracking-[0.2em] text-marca"><span className="sr-only">Entrar na </span>NKG</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-texto">Dos Importados</p>
        </div>

        {/* Região estável: existe vazia antes do erro para o leitor de tela anunciar a falha. */}
        <div role="alert" id="login-erro" className={erro ? 'bg-erro-fundo border border-erro-borda text-erro-texto text-sm p-3 rounded-cartao mb-6 text-center' : ''}>
          {erro}
        </div>

        <Campo
          ref={campoEmail}
          id="login-email"
          rotulo="E-mail"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={erro ? 'login-erro' : undefined}
          className="mb-4"
        />

        <Campo
          id="login-senha"
          rotulo="Senha"
          name="senha"
          type={mostrarSenha ? 'text' : 'password'}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={erro ? 'login-erro' : undefined}
          className="mb-6"
          sufixo={(
            <Botao variante="discreto" tamanho="sm" onClick={() => setMostrarSenha((valor) => !valor)} aria-pressed={mostrarSenha} aria-controls="login-senha" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </Botao>
          )}
        />

        <Turnstile acao="login" aoValidar={setTurnstileToken} />

        <Botao type="submit" tamanho="lg" larguraTotal carregando={carregando} disabled={turnstileAtivo() && !turnstileToken}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </Botao>

        <p className="text-xs text-center mt-6 text-texto-secundario tracking-wider">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-link underline underline-offset-4 hover:text-marca-hover">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
