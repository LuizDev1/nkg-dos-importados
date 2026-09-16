import { useEffect, useState } from 'react';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function PerguntasProduto({ produtoId }) {
  const { usuario } = useAutenticacao();
  const [perguntas, setPerguntas] = useState([]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aberta, setAberta] = useState(true);

  async function carregar() {
    try {
      const resposta = await fetch(`${API_URL}/produtos/${produtoId}/perguntas`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem);
      setPerguntas(dados);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar perguntas');
    }
  }

  useEffect(() => {
    setAberta(true);
    carregar();
  }, [produtoId]);

  async function enviar(evento) {
    evento.preventDefault(); setEnviando(true); setErro('');
    try {
      const resposta = await fetch(`${API_URL}/produtos/${produtoId}/perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ pergunta: texto }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem);
      setTexto(''); await carregar();
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  return <section className="mt-12 border-t border-[#302b20] pt-8">
    <button type="button" onClick={() => setAberta(valor => !valor)} aria-expanded={aberta} aria-controls="conteudo-perguntas" className="flex w-full items-center justify-between rounded-xl bg-[#11120f] px-5 py-4 text-left hover:bg-[#171813]">
      <h2 className="text-xl font-bold">Perguntas e respostas</h2>
      <span className={`text-2xl text-[#d4af45] transition-transform ${aberta ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
    </button>
    {aberta && <div id="conteudo-perguntas" className="px-1 pt-5">
      <p className="text-sm text-[#aaa396]">Tire suas dúvidas sobre este produto.</p>
      {erro && <p role="alert" className="mt-3 text-sm text-red-400">{erro}</p>}
      <div className="mt-5 space-y-3">
        {perguntas.length ? perguntas.map(item => <article key={item.id} className="rounded-lg border border-[#302b20] bg-[#11120f] p-4">
          <p className="font-semibold">Pergunta</p><p className="mt-1 text-sm text-[#d8d1c4]">{item.pergunta}</p><p className="mt-2 text-xs text-[#817b70]">por {item.usuario_nome}</p>
          {item.resposta ? <div className="mt-4 border-l-2 border-[#d4af45] pl-3"><p className="font-semibold text-[#d4af45]">Resposta da loja</p><p className="mt-1 text-sm text-[#d8d1c4]">{item.resposta}</p></div> : <p className="mt-4 text-sm text-[#aaa396]">Aguardando resposta da loja.</p>}
        </article>) : <p className="text-sm text-[#aaa396]">Ainda não há perguntas.</p>}
      </div>
      {usuario?.perfil !== 'admin' && <form onSubmit={enviar} className="mt-5">
        <label className="block text-sm font-semibold">Faça uma pergunta<textarea required minLength="5" maxLength="600" value={texto} onChange={e => setTexto(e.target.value)} className="mt-2 min-h-24 w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2" placeholder="Ex.: O produto tem garantia?" /></label>
        <button disabled={enviando || !usuario} className="mt-3 rounded bg-[#d4af45] px-4 py-2 font-semibold text-[#090a09] disabled:opacity-50">{usuario ? enviando ? 'Enviando...' : 'Enviar pergunta' : 'Entre para perguntar'}</button>
      </form>}
    </div>}
  </section>;
}
