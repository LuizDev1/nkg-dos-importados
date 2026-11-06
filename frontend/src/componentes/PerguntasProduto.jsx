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

  // Seção sempre visível: lista antes do formulário, para a pessoa ver o que já foi perguntado.
  return <section aria-labelledby="titulo-perguntas" className="mt-secao border-t border-divisor pt-bloco">
    <h2 id="titulo-perguntas" className="text-titulo-md text-texto">Perguntas e respostas</h2>
    <p className="mt-2 text-auxiliar text-texto-secundario">Tire suas dúvidas sobre este produto.</p>
    {erro && <p role="alert" className="mt-3 text-sm text-erro">{erro}</p>}
    {perguntas.length ? <ul className="mt-5 max-w-3xl divide-y divide-divisor">
      {perguntas.map(item => <li key={item.id} className="py-5 first:pt-0">
        <article>
          <h3 className="font-semibold text-texto"><span className="sr-only">Pergunta: </span>{item.pergunta}</h3>
          <p className="mt-1 text-legenda text-texto-discreto">por {item.usuario_nome}</p>
          {item.resposta
            ? <div className="mt-3 border-l-2 border-borda-forte pl-4"><p className="text-rotulo text-texto">Resposta da loja</p><p className="mt-1 text-auxiliar text-texto-secundario">{item.resposta}</p></div>
            : <p className="mt-3 text-auxiliar text-texto-secundario">Aguardando resposta da loja.</p>}
        </article>
      </li>)}
    </ul> : <p className="mt-5 text-sm text-texto-secundario">Ainda não há perguntas.</p>}
    {usuario?.perfil !== 'admin' && <form onSubmit={enviar} className="mt-6 max-w-3xl">
      <Campo as="textarea" id="pergunta-produto" rotulo="Faça uma pergunta" name="pergunta" required minLength="5" maxLength="600" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ex.: O produto tem garantia?" />
      <Botao type="submit" variante="secundario" carregando={enviando} disabled={!usuario} className="mt-3">{usuario ? enviando ? 'Enviando...' : 'Enviar pergunta' : 'Entre para perguntar'}</Botao>
    </form>}
  </section>;
}
