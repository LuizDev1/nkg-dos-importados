import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { buscarProduto, listarProdutos } from '../../servicos/produtoService';
import { cotarFrete } from '../../servicos/freteService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import CartaoProduto from '../../componentes/CartaoProduto';
import { useFavoritos } from '../../contextos/ContextoFavoritos';
import { cadastrarAvisoEstoque } from '../../servicos/avisoEstoqueService';
import { listarAvaliacoes, salvarAvaliacao, verificarPermissaoAvaliacao } from '../../servicos/avaliacaoService';

export default function DetalheProduto() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [relacionados, setRelacionados] = useState([]);
  const [cep, setCep] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState('');
  const [variacaoId, setVariacaoId] = useState('');
  const [avisoEstoque, setAvisoEstoque] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [formAvaliacao, setFormAvaliacao] = useState({ nota: 5, comentario: '', foto_url: '' });
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [podeAvaliar, setPodeAvaliar] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState('');

  const { adicionarItem } = useCarrinho();
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro('');
      setRelacionados([]);
      setPodeAvaliar(false);
      try {
        const dados = await buscarProduto(id);
        setProduto(dados);
        setImagemSelecionada(dados.foto_url || dados.imagens?.[0]?.imagem_url || '');
        setQuantidade(1);
        setVariacaoId('');
        setCotacao(null);

        try {
          setAvaliacoes(await listarAvaliacoes(id));
        } catch {
          setAvaliacoes([]);
        }

        if (usuario && usuario.perfil !== 'admin') {
          try {
            const permissao = await verificarPermissaoAvaliacao(id);
            setPodeAvaliar(Boolean(permissao.pode_avaliar));
          } catch {
            setPodeAvaliar(false);
          }
        } else {
          setPodeAvaliar(false);
        }

        if (dados?.categoria) {
          try {
            const produtosRelacionados = await listarProdutos({ categoria: dados.categoria });
            setRelacionados(
              produtosRelacionados.filter((item) => String(item.id) !== String(dados.id)).slice(0, 4)
            );
          } catch {
            setRelacionados([]);
          }
        } else {
          setRelacionados([]);
        }
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id, usuario]);

  function aoAdicionar() {
    const variacao = (produto.variacoes || []).find((item) => String(item.id) === variacaoId);
    adicionarItem(produto, quantidade, variacao || null);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1200);
  }

  async function calcularFrete(evento) {
    evento.preventDefault();
    setErroFrete('');
    setCotacao(null);

    if (!/^\d{5}-?\d{3}$/.test(cep)) {
      setErroFrete('Informe um CEP válido.');
      return;
    }

    setCalculandoFrete(true);
    try {
      const resultado = await cotarFrete(cep, [{
        produto_id: produto.id,
        quantidade,
      }]);
      setCotacao(resultado);
    } catch (erro) {
      setErroFrete(erro.message);
    } finally {
      setCalculandoFrete(false);
    }
  }

  async function solicitarAviso() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    try {
      const resposta = await cadastrarAvisoEstoque(produto.id, variacaoSelecionada?.id);
      setAvisoEstoque(resposta.mensagem);
    } catch (erroAviso) {
      setAvisoEstoque(erroAviso.message);
    }
  }

  async function enviarAvaliacao(evento) {
    evento.preventDefault();
    setSalvandoAvaliacao(true);
    setMensagemAvaliacao('');
    try {
      const resposta = await salvarAvaliacao(produto.id, {
        ...formAvaliacao,
        nota: Number(formAvaliacao.nota),
        foto_url: formAvaliacao.foto_url.trim(),
      });
      setMensagemAvaliacao(resposta.mensagem);
      setAvaliacoes(await listarAvaliacoes(produto.id));
      setFormAvaliacao({ nota: 5, comentario: '', foto_url: '' });
    } catch (erroAvaliacao) {
      setMensagemAvaliacao(erroAvaliacao.message);
    } finally {
      setSalvandoAvaliacao(false);
    }
  }

  if (carregando) return <p className="text-center mt-10">Carregando produto...</p>;
  if (erro) return <p className="text-center mt-10 text-red-600">{erro}</p>;
  if (!produto) return null;
  const variacaoSelecionada = (produto.variacoes || []).find((item) => String(item.id) === variacaoId);
  const estoqueDisponivel = produto.variacoes?.length ? Number(variacaoSelecionada?.estoque_qtd || 0) : Number(produto.estoque_qtd);
  const mediaAvaliacoes = avaliacoes.length
    ? avaliacoes.reduce((total, avaliacao) => total + Number(avaliacao.nota), 0) / avaliacoes.length
    : 0;
  const imagensProduto = [produto.foto_url, ...(produto.imagens || []).map((imagem) => imagem.imagem_url)]
    .filter((url, indice, lista) => url && lista.indexOf(url) === indice);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="botao-voltar">
        &larr; Voltar para a loja
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={imagemSelecionada || 'https://placehold.co/400'}
            alt={produto.nome}
            className="h-80 w-full rounded-lg object-cover transition-opacity"
          />
          {imagensProduto.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2" aria-label="Galeria do produto">
              {imagensProduto.map((url, indice) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImagemSelecionada(url)}
                  className={`overflow-hidden rounded border ${imagemSelecionada === url ? 'border-[#d4af45]' : 'border-[#343024] hover:border-[#8b7437]'}`}
                  aria-label={`Ver foto ${indice + 1}`}
                >
                  <img src={url} alt="" className="h-16 w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{produto.nome}</h1>
            {usuario?.perfil !== 'admin' && (
              <button
                type="button"
                onClick={() => usuario ? alternarFavorito(produto) : navigate('/login')}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-lg ${estaFavorito(produto.id) ? 'border-[#d4af45] bg-[#d4af45] text-[#090a09]' : 'border-[#3a3526] text-[#d4af45] hover:border-[#d4af45]'}`}
                aria-label={estaFavorito(produto.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                {estaFavorito(produto.id) ? '♥' : '♡'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">{produto.categoria}</p>
          <p className="text-2xl font-bold mb-4">
            {Number(produto.preco).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>

          {produto.estoque_qtd > 0 ? (
            <p className="text-sm text-green-600 mb-4">
              Em estoque ({produto.estoque_qtd} disponíveis)
            </p>
          ) : (
            <p className="text-sm text-red-600 mb-4">Fora de estoque</p>
          )}

          {produto.variacoes?.length > 0 && (
            <div className="mb-4">
              <label htmlFor="variacao" className="mb-2 block text-sm font-medium">Escolha uma variação:</label>
              <select
                id="variacao"
                value={variacaoId}
                onChange={(e) => { setVariacaoId(e.target.value); setQuantidade(1); setCotacao(null); setAvisoEstoque(''); }}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">Selecione</option>
                {produto.variacoes.map((variacao) => (
                  <option key={variacao.id} value={variacao.id}>
                    {variacao.nome}{!variacao.estoque_qtd ? ' - indisponível' : ` - ${variacao.estoque_qtd} disponíveis`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={estoqueDisponivel}
              disabled={estoqueDisponivel === 0}
              value={quantidade}
              onChange={(e) => {
                const novaQuantidade = Number(e.target.value);
                setQuantidade(Math.min(Math.max(novaQuantidade || 1, 1), estoqueDisponivel));
                setCotacao(null);
              }}
              className="w-20 border rounded px-2 py-1 text-center"
            />
          </div>

          <button
            onClick={aoAdicionar}
            disabled={estoqueDisponivel === 0}
            className={`w-full py-3 rounded transition ${
              adicionado
                ? 'bg-green-600 text-white'
                : estoqueDisponivel === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {adicionado ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </button>

          {((produto.variacoes?.length > 0 && variacaoSelecionada && estoqueDisponivel === 0)
            || (!produto.variacoes?.length && estoqueDisponivel === 0)) && (
            <button
              type="button"
              onClick={solicitarAviso}
              className="mt-3 w-full rounded border border-[#d4af45] px-4 py-3 font-semibold text-[#d4af45] hover:bg-[#d4af45] hover:text-[#090a09]"
            >
              Avise-me quando estiver disponível
            </button>
          )}
          {avisoEstoque && <p className="mt-2 text-center text-sm text-[#c6c0b5]">{avisoEstoque}</p>}

          <div className="mt-6 border-t border-gray-200 pt-5">
            <h2 className="mb-3 font-semibold">Calcular entrega</h2>
            {usuario ? (
              <form onSubmit={calcularFrete} className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cep}
                  onChange={(evento) => {
                    const numeros = evento.target.value.replace(/\D/g, '').slice(0, 8);
                    setCep(numeros.replace(/^(\d{5})(\d)/, '$1-$2'));
                  }}
                  placeholder="00000-000"
                  aria-label="CEP de entrega"
                  className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={calculandoFrete}
                  className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                >
                  {calculandoFrete ? 'Calculando...' : 'Calcular'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-600">
                <Link to="/login" className="text-blue-600 hover:underline">Entre na sua conta</Link>{' '}
                para calcular o prazo e o valor da entrega.
              </p>
            )}

            {erroFrete && <p className="mt-2 text-sm text-red-600">{erroFrete}</p>}
            {cotacao?.gratuito && (
              <p className="mt-3 rounded bg-green-50 p-3 text-sm font-semibold text-green-700">
                Entrega grátis
              </p>
            )}
            {cotacao && !cotacao.gratuito && (
              <div className="mt-3 space-y-2">
                {(cotacao.opcoes || [cotacao]).map((opcao) => (
                  <div
                    key={opcao.servico_id}
                    className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">
                        {opcao.nome_exibicao || `${opcao.transportadora} - ${opcao.servico_nome}`}
                      </p>
                      <p className="text-gray-500">Até {opcao.prazo_dias} dias</p>
                    </div>
                    <strong>
                      {Number(opcao.valor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ul className="mt-6 space-y-2 border-t border-gray-200 pt-5 text-sm text-gray-600">
            <li>Pagamento processado em ambiente seguro</li>
            <li>Estoque confirmado antes da finalização</li>
            <li>Trocas e devoluções conforme a política da loja</li>
          </ul>
        </div>
      </div>

      <section className="mt-12 border-t border-[#302b20] pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-bold">Avaliações</h2>
          <p className="text-sm text-[#c9c2b5]">
            <span className="text-[#d4af45]">★ {mediaAvaliacoes.toFixed(1)}</span> · {avaliacoes.length} avaliação(ões)
          </p>
        </div>

        {podeAvaliar && (
            <form onSubmit={enviarAvaliacao} className="mb-8 grid gap-4 rounded-xl border border-[#302b20] bg-[#11120f] p-5">
              <p className="font-semibold">Avalie este produto</p>
              <label className="text-sm">
                Nota
                <select
                  value={formAvaliacao.nota}
                  onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, nota: evento.target.value })}
                  className="mt-1 block w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((nota) => <option key={nota} value={nota}>{'★'.repeat(nota)} ({nota})</option>)}
                </select>
              </label>
              <label className="text-sm">
                Comentário
                <textarea
                  required
                  maxLength="1000"
                  value={formAvaliacao.comentario}
                  onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, comentario: evento.target.value })}
                  className="mt-1 min-h-24 w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2"
                  placeholder="Conte como foi sua experiência"
                />
              </label>
              <label className="text-sm">
                Link da foto (opcional)
                <input
                  type="url"
                  maxLength="500"
                  value={formAvaliacao.foto_url}
                  onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, foto_url: evento.target.value })}
                  className="mt-1 w-full rounded border border-[#45402f] bg-[#181915] px-3 py-2"
                  placeholder="https://..."
                />
              </label>
              <button disabled={salvandoAvaliacao} className="rounded bg-[#d4af45] px-5 py-3 font-semibold text-black hover:bg-[#e1c15b] disabled:opacity-60">
                {salvandoAvaliacao ? 'Salvando...' : 'Publicar avaliação'}
              </button>
              {mensagemAvaliacao && <p className="text-sm text-[#d8d1c4]">{mensagemAvaliacao}</p>}
            </form>
        )}

        {avaliacoes.length === 0 ? (
          <p className="text-sm text-[#aaa396]">Ainda não há avaliações para este produto.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {avaliacoes.map((avaliacao) => (
              <article key={avaliacao.id} className="rounded-xl border border-[#302b20] bg-[#11120f] p-5">
                <div className="flex items-center justify-between gap-3">
                  <strong>{avaliacao.usuario_nome}</strong>
                  <span className="text-[#d4af45]">{'★'.repeat(Number(avaliacao.nota))}</span>
                </div>
                {avaliacao.comentario && <p className="mt-3 text-sm text-[#d1cabd]">{avaliacao.comentario}</p>}
                {avaliacao.foto_url && <img src={avaliacao.foto_url} alt="Foto enviada na avaliação" loading="lazy" className="mt-4 max-h-72 w-full rounded-lg object-cover" />}
                <time className="mt-3 block text-xs text-[#817b70]">{new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}</time>
              </article>
            ))}
          </div>
        )}
      </section>

      {relacionados.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-5 text-xl font-bold">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((item) => (
              <CartaoProduto key={item.id} produto={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
