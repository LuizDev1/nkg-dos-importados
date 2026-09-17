import SeletorFotos from '../../componentes/SeletorFotos';
import { corStatus } from '../../servicos/statusVisual';
import CampoRotulado from '../../componentes/CampoRotulado';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listarProdutosAdmin, criarProduto, atualizarProduto, removerProduto, reativarProduto, listarVariacoesAdmin, criarVariacao, atualizarVariacao, excluirVariacao } from '../../servicos/produtoService';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';

const FORM_VAZIO = { tamanhos: [], nome: '', categoria: '', preco: '', tag: '', foto_url: '', imagens_urls: '', estoque_qtd: '', estoque_minimo: '5', peso_kg: '0.300', largura_cm: '20', altura_cm: '10', comprimento_cm: '30' };
const VARIACAO_VAZIA = { nome: '', tamanhos: [], estoques: {}, estoque_qtd: '' };

export default function Produtos() {
  const [parametros, setParametros] = useSearchParams();
  const editarId = parametros.get('editar');
  const variacaoId = parametros.get('variacao');
  const [enviandoFotos, setEnviandoFotos] = useState(false), [produtos, setProdutos] = useState([]), [carregando, setCarregando] = useState(true), [erro, setErro] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO), [editandoId, setEditandoId] = useState(null), [variacoes, setVariacoes] = useState([]), [novasVariacoes, setNovasVariacoes] = useState([]), [novaVariacao, setNovaVariacao] = useState(VARIACAO_VAZIA);

  async function carregar() { try { setCarregando(true); const lista = await listarProdutosAdmin(); setProdutos(lista); return lista; } catch (e) { setErro(e.message); return []; } finally { setCarregando(false); } }
  function aoMudarCampo(e) { setForm(atual => ({ ...atual, [e.target.name]: e.target.value })); }

  const iniciarEdicao = useCallback(async (produto) => {
    setFormularioAberto(true);
    setEnviandoFotos(false); setEditandoId(produto.id); setNovasVariacoes([]); setNovaVariacao(VARIACAO_VAZIA);
    setForm({ tamanhos: produto.tamanhos || [], nome: produto.nome, categoria: produto.categoria || '', preco: produto.preco, tag: produto.tag || '', foto_url: produto.foto_url || '', imagens_urls: (produto.imagens || []).map(i => i.imagem_url).join('\n'), estoque_qtd: produto.estoque_qtd, estoque_minimo: produto.estoque_minimo ?? 5, peso_kg: produto.peso_kg || '0.300', largura_cm: produto.largura_cm || '20', altura_cm: produto.altura_cm || '10', comprimento_cm: produto.comprimento_cm || '30' });
    try {
      const lista = await listarVariacoesAdmin(produto.id);
      setVariacoes(lista);
      if (variacaoId && lista.some(item => String(item.id) === variacaoId)) {
        window.setTimeout(() => document.getElementById(`variacao-${variacaoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
    } catch (e) { setErro(e.message); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [variacaoId]);
  useEffect(() => {
    let ativo = true;
    carregar().then(lista => {
      if (!ativo) return;
      const produto = lista.find(item => String(item.id) === editarId);
      if (produto) iniciarEdicao(produto);
    });
    return () => { ativo = false; };
  }, [editarId, iniciarEdicao]);
  function cancelarEdicao() { setEnviandoFotos(false); setEditandoId(null); setForm(FORM_VAZIO); setVariacoes([]); setNovasVariacoes([]); setNovaVariacao(VARIACAO_VAZIA); setParametros({}); }

  function adicionarNovaVariacao() {
    const nome = novaVariacao.nome.trim(), tamanhos = form.tamanhos.length ? novaVariacao.tamanhos : [''];
    if (!tamanhos.length) return setErro('Escolha pelo menos um tamanho.');
    if (!form.tamanhos.length && !nome) return setErro('Informe a cor/variacao.');
    const combinacoes = tamanhos.map(tamanho => ({ nome, tamanho, estoque_qtd: Number(tamanho ? novaVariacao.estoques[tamanho] : novaVariacao.estoque_qtd) }));
    if (combinacoes.some(item => !Number.isInteger(item.estoque_qtd) || item.estoque_qtd < 0)) return setErro('Informe um estoque valido para cada tamanho.');
    const existentes = [...variacoes, ...novasVariacoes];
    if (combinacoes.some(item => existentes.some(v => v.nome.toLowerCase() === item.nome.toLowerCase() && (v.tamanho || '') === item.tamanho))) return setErro('Uma das combinacoes ja foi adicionada.');
    setNovasVariacoes(atuais => [...atuais, ...combinacoes]); setNovaVariacao(VARIACAO_VAZIA); setErro('');
  }

  async function aoSalvar(e) {
    e.preventDefault(); if (enviandoFotos) return; setErro('');
    try {
      const dados = { ...form, imagens: form.imagens_urls.split(/\r?\n/).map(url => url.trim()).filter(Boolean) }; delete dados.imagens_urls;
      if (novasVariacoes.length) dados.estoque_qtd = [...variacoes, ...novasVariacoes].reduce((total, v) => total + Number(v.estoque_qtd), 0);
      let produtoId = editandoId;
      if (editandoId) await atualizarProduto(editandoId, dados); else produtoId = (await criarProduto(dados)).id;
      for (const variacao of novasVariacoes) await criarVariacao(produtoId, variacao);
      const mensagem = editandoId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.';
      cancelarEdicao(); await carregar(); avisarAdmin(mensagem);
    } catch (e) { setErro(e.message); }
  }
  async function salvarVariacao(v) {
    try {
      setErro('');
      await atualizarVariacao(editandoId, v.id, {
        nome: v.nome, tamanho: v.tamanho || '', ativo: Boolean(Number(v.ativo)),
        estoque_qtd: Number(v.estoque_qtd),
      });
      const atualizadas = await listarVariacoesAdmin(editandoId);
      setVariacoes(atuais => atualizadas.map(item => {
        const rascunho = atuais.find(atual => atual.id === item.id);
        return item.id !== v.id && rascunho
          ? { ...item, estoque_qtd: rascunho.estoque_qtd }
          : item;
      }));
      await carregar();
      avisarAdmin('Estoque da variação atualizado com sucesso.');
    } catch (e) { setErro(e.message); }
  }
  async function removerVariacao(id) { if (!window.confirm('Excluir esta variacao?')) return; try { await excluirVariacao(editandoId, id); setVariacoes(await listarVariacoesAdmin(editandoId)); await carregar(); avisarAdmin('Variação removida com sucesso.'); } catch (e) { setErro(e.message); } }
  async function aoAlternarAtivo(produto) { try { if (produto.ativo) await removerProduto(produto.id); else await reativarProduto(produto.id); await carregar(); avisarAdmin(produto.ativo ? 'Produto desativado com sucesso.' : 'Produto reativado com sucesso.'); } catch (e) { setErro(e.message); } }

  const todasVariacoes = [...variacoes, ...novasVariacoes], estoqueCalculado = todasVariacoes.reduce((total, v) => total + Number(v.estoque_qtd), 0);
  return <div className="max-w-5xl mx-auto px-4 py-8">
    <Link to="/admin" className="botao-voltar">&larr; Voltar ao painel</Link><h1 className="text-2xl font-bold mt-2 mb-6">Produtos</h1>{erro && <p className="text-red-600 mb-4">{erro}</p>}
    <section className="mb-8 rounded-lg border border-[#393323] bg-white shadow">
      <button type="button" aria-expanded={formularioAberto} aria-controls="formulario-produto" onClick={() => setFormularioAberto(aberto => !aberto)} className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-left font-semibold hover:bg-[#22221b]">
        <span>{editandoId ? `Editar produto: ${form.nome}` : 'Cadastrar produto'}</span>
        <span className={`text-xl text-[#d4af45] transition-transform ${formularioAberto ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
      </button>
    {formularioAberto && <form id="formulario-produto" onSubmit={aoSalvar} className="grid grid-cols-2 gap-3 border-t border-[#393323] p-4 sm:grid-cols-3">
      <CampoRotulado rotulo="Nome" name="nome" value={form.nome} onChange={aoMudarCampo} required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Categoria" name="categoria" value={form.categoria} onChange={aoMudarCampo} className="border rounded px-2 py-1" /><CampoRotulado rotulo="Preco" name="preco" value={form.preco} onChange={aoMudarCampo} type="number" step="0.01" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Tag" name="tag" value={form.tag} onChange={aoMudarCampo} className="border rounded px-2 py-1" />
      <fieldset className="col-span-2 sm:col-span-3"><legend className="mb-2 text-sm font-semibold">Tamanhos disponiveis (opcional)</legend><div className="flex flex-wrap gap-2">{['PP','P','M','G','GG'].map(t => <label key={t} className="rounded border border-[#45402f] px-3 py-2 text-sm text-[#d4af45]"><input type="checkbox" checked={form.tamanhos.includes(t)} onChange={e => setForm(a => ({ ...a, tamanhos: e.target.checked ? [...a.tamanhos, t] : a.tamanhos.filter(x => x !== t) }))} className="mr-2" />{t}</label>)}</div></fieldset>
      <fieldset className="col-span-2 sm:col-span-3 rounded border border-[#393323] p-3"><legend className="ml-2 px-2 text-sm font-semibold leading-5">Variações e estoque</legend>
        <CampoRotulado rotulo="Cor/variacao (opcional quando houver tamanho)" value={novaVariacao.nome} onChange={e => setNovaVariacao(a => ({ ...a, nome: e.target.value }))} placeholder="Ex.: Branca" className="border rounded px-2 py-1" />
        {form.tamanhos.length ? <div className="mt-3 grid gap-2 sm:grid-cols-3">{form.tamanhos.map(t => { const marcado = novaVariacao.tamanhos.includes(t); return <label key={t} className="rounded border border-[#45402f] p-2 text-sm"><span className="flex gap-2"><input type="checkbox" checked={marcado} onChange={e => setNovaVariacao(a => ({ ...a, tamanhos: e.target.checked ? [...a.tamanhos, t] : a.tamanhos.filter(x => x !== t) }))} />Tamanho {t}</span>{marcado && <input type="number" min="0" required value={novaVariacao.estoques[t] ?? ''} onChange={e => setNovaVariacao(a => ({ ...a, estoques: { ...a.estoques, [t]: e.target.value } }))} placeholder="Estoque" className="mt-2 w-full rounded border px-2 py-1" />}</label>; })}</div> : <div className="mt-3"><CampoRotulado rotulo="Estoque da variacao" type="number" min="0" value={novaVariacao.estoque_qtd} onChange={e => setNovaVariacao(a => ({ ...a, estoque_qtd: e.target.value }))} className="border rounded px-2 py-1" /></div>}
        <button type="button" onClick={adicionarNovaVariacao} className="mt-3 rounded bg-[#d4af45] px-4 py-2 text-[#090a09]">Adicionar combinacoes</button>
        {todasVariacoes.length > 0 && <div className="mt-4 space-y-2">{variacoes.map((v, i) => <div id={`variacao-${v.id}`} key={v.id} className={`flex flex-wrap items-end gap-3 rounded bg-[#171813] p-3 text-sm ${parametros.get('variacao') === String(v.id) ? 'ring-2 ring-[#d4af45]' : ''}`}><span className="min-w-36 flex-1">{v.nome || 'Sem cor'}{v.tamanho ? ` / ${v.tamanho}` : ''}</span><label>Estoque<input type="number" min="0" value={v.estoque_qtd} onChange={e => setVariacoes(a => a.map((item, n) => n === i ? { ...item, estoque_qtd: e.target.value } : item))} className="ml-2 w-24 rounded border px-2 py-1" /></label><button type="button" onClick={() => salvarVariacao(v)} className="text-[#d4af45]">Salvar</button><button type="button" onClick={() => removerVariacao(v.id)} className="text-red-400">Remover</button></div>)}{novasVariacoes.map((v, i) => <div key={`nova-${i}`} className="flex justify-between rounded bg-[#171813] px-3 py-2 text-sm"><span>{v.nome || 'Sem cor'}{v.tamanho ? ` / ${v.tamanho}` : ''} - {v.estoque_qtd} unidade(s)</span><button type="button" onClick={() => setNovasVariacoes(a => a.filter((_, n) => n !== i))} className="text-red-400">Remover</button></div>)}</div>}
      </fieldset>
      <SeletorFotos key={editandoId || 'novo'} maximo={10} rotulo="Fotos do produto" fotos={[form.foto_url, ...form.imagens_urls.split(/\r?\n/)].filter(Boolean)} onCarregando={setEnviandoFotos} onChange={fotos => setForm(a => ({ ...a, foto_url: fotos[0] || '', imagens_urls: fotos.slice(1).join('\n') }))} />
      <CampoRotulado rotulo={todasVariacoes.length ? 'Estoque total (automatico)' : 'Estoque'} name="estoque_qtd" value={todasVariacoes.length ? estoqueCalculado : form.estoque_qtd} disabled={Boolean(todasVariacoes.length)} onChange={aoMudarCampo} type="number" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Alerta em" name="estoque_minimo" value={form.estoque_minimo} onChange={aoMudarCampo} type="number" min="0" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Peso (kg)" name="peso_kg" value={form.peso_kg} onChange={aoMudarCampo} type="number" min="0.001" step="0.001" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Largura (cm)" name="largura_cm" value={form.largura_cm} onChange={aoMudarCampo} type="number" min="1" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Altura (cm)" name="altura_cm" value={form.altura_cm} onChange={aoMudarCampo} type="number" min="1" required className="border rounded px-2 py-1" /><CampoRotulado rotulo="Comprimento (cm)" name="comprimento_cm" value={form.comprimento_cm} onChange={aoMudarCampo} type="number" min="1" required className="border rounded px-2 py-1" />
      <div className="col-span-2 sm:col-span-3 flex gap-2"><button type="submit" disabled={enviandoFotos} className="bg-blue-600 text-white px-4 py-2 rounded">{editandoId ? 'Salvar edicao' : 'Adicionar produto'}</button>{editandoId && <button type="button" onClick={cancelarEdicao} className="px-4 py-2">Cancelar</button>}</div>
    </form>}
    </section>
    {carregando ? <p>Carregando produtos...</p> : <table className="w-full bg-white rounded-lg shadow overflow-hidden"><thead className="bg-gray-100 text-left text-sm"><tr><th className="p-3">Nome</th><th className="p-3">Preco</th><th className="p-3">Estoque</th><th className="p-3">Status</th><th className="p-3">Acoes</th></tr></thead><tbody>{produtos.map(p => <tr key={p.id} className="border-t text-sm"><td className="p-3">{p.nome}</td><td className="p-3">{Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-3">{p.estoque_qtd}</td><td className="p-3"><span className={corStatus(p.ativo ? 'ativo' : 'inativo')}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td><td className="p-3 flex gap-3"><button onClick={() => iniciarEdicao(p)} className="text-blue-600">Editar</button><button onClick={() => aoAlternarAtivo(p)} className={p.ativo ? 'text-red-600' : 'text-green-600'}>{p.ativo ? 'Remover' : 'Reativar'}</button></td></tr>)}</tbody></table>}
  </div>;
}
