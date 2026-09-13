import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAutenticacao();
  const navegar = useNavigate();
  const location = useLocation();

  // Captura o destino anterior ou define '/' como padrão
  const from = location.state?.from || '/';

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const dados = await login(email, senha);
      
      // Admin sempre vai pro painel, cliente vai para a rota original
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={aoEnviar}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>

        {erro && (
          <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
            {erro}
          </p>
        )}

        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm text-center mt-4">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}