import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listarProdutosAdmin,
  criarProduto,
  atualizarProduto,
  removerProduto,
  reativarProduto,
} from '../../servicos/produtoService';

const FORM_VAZIO = {
  nome: '',
  categoria: '',
  preco: '',
  tag: '',
  foto_url: '',
  estoque_qtd: '',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);

  async function carregar() {
    try {
      setCarregando(true);
      const dados = await listarProdutosAdmin();
      setProdutos(dados);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function aoMudarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function iniciarEdicao(produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria || '',
      preco: produto.preco,
      tag: produto.tag || '',
      foto_url: produto.foto_url || '',
      estoque_qtd: produto.estoque_qtd,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  async function aoSalvar(e) {
    e.preventDefault();
    setErro('');

    try {
      if (editandoId) {
        await atualizarProduto(editandoId, form);
      } else {
        await criarProduto(form);
      }

      cancelarEdicao();
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  async function aoAlternarAtivo(produto) {
    try {
      if (produto.ativo) {
        await removerProduto(produto.id);
      } else {
        await reativarProduto(produto.id);
      }
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar ao painel
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">Produtos</h1>

      {erro && <p className="text-red-600 mb-4">{erro}</p>}

      <form onSubmit={aoSalvar} className="bg-white rounded-lg shadow p-4 mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <input name="nome" value={form.nome} onChange={aoMudarCampo} placeholder="Nome" required className="border rounded px-2 py-1" />
        <input name="categoria" value={form.categoria} onChange={aoMudarCampo} placeholder="Categoria" className="border rounded px-2 py-1" />
        <input name="preco" value={form.preco} onChange={aoMudarCampo} placeholder="Preço" type="number" step="0.01" required className="border rounded px-2 py-1" />
        <input name="tag" value={form.tag} onChange={aoMudarCampo} placeholder="Tag" className="border rounded px-2 py-1" />
        <input name="foto_url" value={form.foto_url} onChange={aoMudarCampo} placeholder="URL da foto" className="border rounded px-2 py-1" />
        <input name="estoque_qtd" value={form.estoque_qtd} onChange={aoMudarCampo} placeholder="Estoque" type="number" required className="border rounded px-2 py-1" />

        <div className="col-span-2 sm:col-span-3 flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editandoId ? 'Salvar edição' : 'Adicionar produto'}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelarEdicao} className="text-gray-600 px-4 py-2">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {carregando ? (
        <p>Carregando produtos...</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="border-t text-sm">
                <td className="p-3">{produto.nome}</td>
                <td className="p-3">
                  {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-3">{produto.estoque_qtd}</td>
                <td className="p-3">
                  <span className={produto.ativo ? 'text-green-600' : 'text-gray-400'}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => iniciarEdicao(produto)} className="text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => aoAlternarAtivo(produto)} className="text-red-600 hover:underline">
                    {produto.ativo ? 'Remover' : 'Reativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
