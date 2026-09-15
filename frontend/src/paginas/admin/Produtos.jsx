import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  listarProdutosAdmin,
  criarProduto,
  atualizarProduto,
  removerProduto,
  reativarProduto,
  listarVariacoesAdmin,
  criarVariacao,
  atualizarVariacao,
  excluirVariacao,
} from '../../servicos/produtoService';

const FORM_VAZIO = {
  nome: '',
  categoria: '',
  preco: '',
  tag: '',
  foto_url: '',
  imagens_urls: '',
  estoque_qtd: '',
  peso_kg: '0.300',
  largura_cm: '20',
  altura_cm: '10',
  comprimento_cm: '30',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [produtoVariacoes, setProdutoVariacoes] = useState(null);
  const [variacoes, setVariacoes] = useState([]);
  const [formVariacao, setFormVariacao] = useState({ nome: '', estoque_qtd: '', ativo: true });
  const [variacaoEditandoId, setVariacaoEditandoId] = useState(null);

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
      imagens_urls: (produto.imagens || []).map((imagem) => imagem.imagem_url).join('\n'),
      estoque_qtd: produto.estoque_qtd,
      peso_kg: produto.peso_kg || '0.300',
      largura_cm: produto.largura_cm || '20',
      altura_cm: produto.altura_cm || '10',
      comprimento_cm: produto.comprimento_cm || '30',
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
      const dadosProduto = {
        ...form,
        imagens: form.imagens_urls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
      };
      delete dadosProduto.imagens_urls;
      if (editandoId) {
        await atualizarProduto(editandoId, dadosProduto);
      } else {
        await criarProduto(dadosProduto);
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

  async function abrirVariacoes(produto) {
    try {
      setProdutoVariacoes(produto);
      setVariacoes(await listarVariacoesAdmin(produto.id));
      setFormVariacao({ nome: '', estoque_qtd: '', ativo: true });
      setVariacaoEditandoId(null);
    } catch (e) { setErro(e.message); }
  }

  async function salvarVariacao(evento) {
    evento.preventDefault();
    try {
      const dados = { ...formVariacao, estoque_qtd: Number(formVariacao.estoque_qtd) };
      if (variacaoEditandoId) await atualizarVariacao(produtoVariacoes.id, variacaoEditandoId, dados);
      else await criarVariacao(produtoVariacoes.id, dados);
      await abrirVariacoes(produtoVariacoes);
      await carregar();
    } catch (e) { setErro(e.message); }
  }

  async function removerVariacao(variacaoId) {
    if (!window.confirm('Excluir esta variação?')) return;
    try { await excluirVariacao(produtoVariacoes.id, variacaoId); await abrirVariacoes(produtoVariacoes); await carregar(); }
    catch (e) { setErro(e.message); }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="botao-voltar">
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
        <textarea name="imagens_urls" value={form.imagens_urls} onChange={aoMudarCampo} placeholder={'Fotos adicionais (uma URL por linha)'} className="col-span-2 rounded border px-2 py-2 sm:col-span-3" rows="3" />
        <input name="estoque_qtd" value={form.estoque_qtd} onChange={aoMudarCampo} placeholder="Estoque" type="number" required className="border rounded px-2 py-1" />
        <input name="peso_kg" value={form.peso_kg} onChange={aoMudarCampo} placeholder="Peso (kg)" type="number" min="0.001" step="0.001" required className="border rounded px-2 py-1" />
        <input name="largura_cm" value={form.largura_cm} onChange={aoMudarCampo} placeholder="Largura (cm)" type="number" min="1" step="0.01" required className="border rounded px-2 py-1" />
        <input name="altura_cm" value={form.altura_cm} onChange={aoMudarCampo} placeholder="Altura (cm)" type="number" min="1" step="0.01" required className="border rounded px-2 py-1" />
        <input name="comprimento_cm" value={form.comprimento_cm} onChange={aoMudarCampo} placeholder="Comprimento (cm)" type="number" min="1" step="0.01" required className="border rounded px-2 py-1" />

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
                  <button onClick={() => abrirVariacoes(produto)} className="text-purple-600 hover:underline">
                    Variações
                  </button>
                  <button
                    onClick={() => aoAlternarAtivo(produto)}
                    className={produto.ativo
                      ? 'text-red-600 hover:underline'
                      : 'text-green-600 hover:underline'}
                  >
                    {produto.ativo ? 'Remover' : 'Reativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {produtoVariacoes && createPortal((
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setProdutoVariacoes(null);
          }}
        >
        <section role="dialog" aria-modal="true" aria-labelledby="titulo-variacoes" className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#393323] bg-[#111210] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.72)] sm:p-6">
          <div className="mb-6 flex items-center justify-between border-b border-[#2d291f] pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b99a42]">Estoque por opção</p>
              <h2 id="titulo-variacoes" className="mt-1 text-lg font-bold sm:text-xl">Variações de {produtoVariacoes.nome}</h2>
            </div>
            <button type="button" onClick={() => setProdutoVariacoes(null)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#343024] text-lg text-gray-500 hover:border-[#d4af45] hover:text-[#d4af45]" aria-label="Fechar modal">×</button>
          </div>
          <form onSubmit={salvarVariacao} className="variacoes-form mb-6 grid gap-3 rounded-lg bg-[#171813] p-4 sm:grid-cols-[minmax(0,1fr)_130px_auto]">
            <input required value={formVariacao.nome} onChange={(e) => setFormVariacao({ ...formVariacao, nome: e.target.value })} placeholder="Ex.: Azul / Tamanho M" aria-label="Nome da variação" className="rounded border px-3 py-2.5" />
            <input required type="number" min="0" value={formVariacao.estoque_qtd} onChange={(e) => setFormVariacao({ ...formVariacao, estoque_qtd: e.target.value })} placeholder="Estoque" aria-label="Quantidade em estoque" className="rounded border px-3 py-2.5" />
            <button className="rounded bg-[#d4af45] px-4 py-2.5 font-semibold text-[#090a09] hover:bg-[#e2c25d]">{variacaoEditandoId ? 'Salvar' : 'Adicionar'}</button>
            {variacaoEditandoId && <button type="button" onClick={() => { setVariacaoEditandoId(null); setFormVariacao({ nome: '', estoque_qtd: '', ativo: true }); }} className="text-left text-xs text-[#aaa399] hover:text-[#d4af45] sm:col-span-3">Cancelar edição</button>}
          </form>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#aaa399]">Variações cadastradas</h3>
          <div className="space-y-2">
            {variacoes.length === 0 && <p className="rounded-lg border border-dashed border-[#343024] p-6 text-center text-sm text-[#817b70]">Nenhuma variação cadastrada.</p>}
            {variacoes.map((variacao) => (
              <div key={variacao.id} className="flex flex-col gap-3 rounded-lg border border-[#2d291f] bg-[#151612] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">{variacao.nome}</p><p className="mt-1 text-xs text-[#aaa399]">{variacao.estoque_qtd} unidade(s) em estoque</p></div>
                <div className="flex gap-2">
                  <button onClick={() => { setVariacaoEditandoId(variacao.id); setFormVariacao({ nome: variacao.nome, estoque_qtd: variacao.estoque_qtd, ativo: Boolean(variacao.ativo) }); }} className="rounded border border-[#49422f] px-3 py-1.5 text-xs font-semibold text-[#d4af45] hover:border-[#d4af45]">Editar</button>
                  <button onClick={() => removerVariacao(variacao.id)} className="rounded border border-red-900/70 px-3 py-1.5 text-xs font-semibold text-red-300 hover:border-red-500 hover:bg-red-950/30">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        </div>
      ), document.body)}
    </div>
  );
}
