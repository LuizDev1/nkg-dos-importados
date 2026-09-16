import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarProdutos } from '../../servicos/produtoService';
import { listarPerguntas, responderPergunta } from '../../servicos/perguntaService';
import { avisarAdmin } from '../../utilitarios/avisoAdmin';

function CardPergunta({ pergunta, onAtualizar }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(pergunta.resposta || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    const resposta = texto.trim();
    if (resposta.length < 2) { setErro('Escreva uma resposta com pelo menos 2 caracteres.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await responderPergunta(pergunta.id, resposta);
      onAtualizar(pergunta.id, resposta);
      setEditando(false);
      avisarAdmin(pergunta.resposta ? 'Resposta atualizada com sucesso.' : 'Resposta publicada com sucesso.');
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  return (
    <article className="rounded-lg border border-[#302b20] bg-[#11120f] p-5">
      <p className="font-semibold">Pergunta de {pergunta.usuario_nome}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[#d8d1c4]">{pergunta.pergunta}</p>
      {pergunta.resposta && (
        <div className="mt-4 border-l-2 border-[#d4af45] pl-3">
          <p className="font-semibold text-[#d4af45]">Resposta da loja</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#d8d1c4]">{pergunta.resposta}</p>
        </div>
      )}
      {editando ? (
        <form onSubmit={salvar} className="mt-4">
          <label className="block text-sm font-semibold">
            {pergunta.resposta ? 'Editar resposta' : 'Resposta da loja'}
            <textarea required minLength="2" maxLength="1000" value={texto} disabled={salvando} onChange={e => setTexto(e.target.value)} className="mt-2 min-h-24 w-full rounded border border-[#45402f] bg-[#181915] p-2" placeholder="Escreva uma resposta clara e objetiva" autoFocus />
          </label>
          {erro && <p role="alert" className="mt-2 text-sm text-red-400">{erro}</p>}
          <div className="mt-3 flex gap-3">
            <button disabled={salvando} className="rounded bg-[#d4af45] px-4 py-2 font-semibold text-[#090a09] disabled:opacity-50">{salvando ? 'Salvando...' : pergunta.resposta ? 'Salvar alterações' : 'Publicar resposta'}</button>
            <button type="button" disabled={salvando} onClick={() => { setEditando(false); setTexto(pergunta.resposta || ''); setErro(''); }} className="rounded border border-[#45402f] px-4 py-2 text-sm text-[#aaa396]">Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => { setTexto(pergunta.resposta || ''); setEditando(true); }} className="mt-4 rounded border border-[#45402f] px-4 py-2 text-sm font-semibold text-[#d4af45] hover:border-[#d4af45]">{pergunta.resposta ? 'Editar resposta' : 'Responder'}</button>
      )}
    </article>
  );
}

export default function Perguntas() {
  const [produtos, setProdutos] = useState([]); const [produtoId, setProdutoId] = useState(''); const [perguntas, setPerguntas] = useState([]); const [erro, setErro] = useState('');
  useEffect(() => { listarProdutos().then((dados) => { setProdutos(dados); if (dados[0]) setProdutoId(String(dados[0].id)); }).catch((e) => setErro(e.message)); }, []);
  useEffect(() => {
    let ativo = true;
    setPerguntas([]);
    setErro('');
    if (produtoId) listarPerguntas(produtoId).then(dados => { if (ativo) setPerguntas(dados); }).catch(e => { if (ativo) setErro(e.message); });
    return () => { ativo = false; };
  }, [produtoId]);
  const produtoSelecionado = produtos.find((produto) => String(produto.id) === produtoId);
  const categorias = [...new Set(produtos.map((produto) => produto.categoria || 'Sem categoria'))].sort();
  return <main className="mx-auto max-w-4xl px-4 py-8"><Link to="/admin" className="botao-voltar mb-4 inline-flex">&larr; Voltar ao painel</Link><h1 className="text-2xl font-bold">Perguntas de produtos</h1><p className="mt-2 text-sm text-gray-500">Responda dúvidas dos clientes para ajudar na decisão de compra.</p>{erro && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-red-700">{erro}</p>}<section className="mt-6 flex flex-col gap-3 rounded-lg border border-[#2b2618] bg-[#111210] p-5 shadow-sm sm:flex-row sm:items-end"><label className="min-w-0 flex-1 text-sm font-semibold text-[#f4efe5]">Produto ativo<select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className="mt-2 block w-full rounded border border-[#3a3526] bg-[#181915] px-3 py-2.5 text-[#f4efe5] focus:border-[#d4af45] focus:outline-none">{categorias.map((categoria) => <optgroup key={categoria} label={categoria}>{produtos.filter((produto) => (produto.categoria || 'Sem categoria') === categoria).map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}</optgroup>)}</select></label>{produtoSelecionado && <div className="rounded border border-[#3a3526] bg-[#181915] px-4 py-2.5 text-sm text-[#c6c0b5]"><span className="text-xs uppercase tracking-wide text-[#aaa396]">Selecionado</span><strong className="ml-2 text-[#d4af45]">{produtoSelecionado.nome}</strong></div>}</section><section className="mt-6 space-y-4">{perguntas.length ? perguntas.map((pergunta) => <CardPergunta key={produtoId + '-' + pergunta.id} pergunta={pergunta} onAtualizar={(id, resposta) => setPerguntas(atuais => atuais.map(item => item.id === id ? { ...item, resposta } : item))} />) : <p className="rounded bg-white p-6 text-center text-gray-500 shadow">Não há perguntas para este produto.</p>}</section></main>;
}
