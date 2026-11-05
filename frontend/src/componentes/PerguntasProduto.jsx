import { useCallback, useEffect, useState } from 'react';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import Botao from './ui/Botao';
import Campo from './ui/Campo';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function PerguntasProduto({ produtoId }) {
  const { usuario } = useAutenticacao();
  const [perguntas, setPerguntas] = useState([]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aberta, setAberta] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(`${API_URL}/produtos/${produtoId}/perguntas`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem);
      setPerguntas(dados);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar perguntas');
    }
  }, [produtoId]);

  useEffect(() => {
    setAberta(true);
    carregar();
  }, [carregar]);

  async function enviar(evento) {
    evento.preventDefault(); setEnviando(true); setErro('');
    try {
      const resposta = await fetch(`${API_URL}/produtos/${produtoId}/perguntas`, {
        method: 'POST',
headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: texto }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem);
      setTexto(''); await carregar();
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  return <section className="mt-12 border-t border-divisor pt-8">
    <button type="button" onClick={() => setAberta(valor => !valor)} aria-expanded={aberta} aria-controls="conteudo-perguntas" className="flex w-full items-center justify-between rounded-painel bg-superficie px-5 py-4 text-left hover:bg-superficie-elevada">
      <h2 className="text-xl font-bold">Perguntas e respostas</h2>
      <span className={`text-2xl text-marca transition-transform ${aberta ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
    </button>
    {aberta && <div id="conteudo-perguntas" className="px-1 pt-5">
      <p className="text-sm text-texto-secundario">Tire suas dúvidas sobre este produto.</p>
      {erro && <p role="alert" className="mt-3 text-sm text-erro">{erro}</p>}
      <div className="mt-5 space-y-3">
        {perguntas.length ? perguntas.map(item => <article key={item.id} className="rounded-cartao border border-divisor bg-superficie p-4">
          <p className="font-semibold">Pergunta</p><p className="mt-1 text-sm text-texto">{item.pergunta}</p><p className="mt-2 text-xs text-texto-secundario">por {item.usuario_nome}</p>
          {item.resposta ? <div className="mt-4 border-l-2 border-marca pl-3"><p className="font-semibold text-marca">Resposta da loja</p><p className="mt-1 text-sm text-texto">{item.resposta}</p></div> : <p className="mt-4 text-sm text-texto-secundario">Aguardando resposta da loja.</p>}
        </article>) : <p className="text-sm text-texto-secundario">Ainda não há perguntas.</p>}
      </div>
      {usuario?.perfil !== 'admin' && <form onSubmit={enviar} className="mt-5">
        <Campo as="textarea" id="pergunta-produto" rotulo="Faça uma pergunta" name="pergunta" required minLength="5" maxLength="600" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ex.: O produto tem garantia?" />
        <Botao type="submit" carregando={enviando} disabled={!usuario} className="mt-3">{usuario ? enviando ? 'Enviando...' : 'Enviar pergunta' : 'Entre para perguntar'}</Botao>
      </form>}
    </div>}
  </section>;
}
