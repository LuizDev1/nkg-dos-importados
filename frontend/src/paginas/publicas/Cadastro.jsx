import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../../servicos/autenticacaoService';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
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
      await registrar({ nome, email, senha, perfil: 'cliente' });
      setSucesso(true);
      setTimeout(() => navegar('/login'), 1500);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Criar conta</h1>

        {erro && (
          <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">
            Cadastro feito! Redirecionando para o login...
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-sm text-center mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}