import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { buscarProduto, listarProdutos } from '../../servicos/produtoService';
import { cotarFrete } from '../../servicos/freteService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import CartaoProduto from '../../componentes/CartaoProduto';
import { useFavoritos } from '../../contextos/ContextoFavoritos';
import { cadastrarAvisoEstoque } from '../../servicos/avisoEstoqueService';
import { listarAvaliacoes, salvarAvaliacao, verificarPermissaoAvaliacao, marcarAvaliacaoUtil } from '../../servicos/avaliacaoService';
import PerguntasProduto from '../../componentes/PerguntasProduto';
import Botao from '../../componentes/ui/Botao';
import BotaoIcone from '../../componentes/ui/BotaoIcone';
import Campo from '../../componentes/ui/Campo';
import Preco from '../../componentes/ui/Preco';
import Superficie from '../../componentes/ui/Superficie';
import {
  Estrelas, IconeAlerta, IconeCaminhao, IconeCamera, IconeCheck, IconeCoracao, IconeEscudo, IconeTroca, IconeUtil, SemImagem,
} from '../../componentes/IconesProduto';
import { formatarNota, textoAvaliacoes, textoTamanhosIndisponiveis } from '../../servicos/produtoVisual.mjs';

const ORDEM_TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];

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
  const [corSelecionada, setCorSelecionada] = useState('');
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [variacaoId, setVariacaoId] = useState('');
  const [avisoEstoque, setAvisoEstoque] = useState('');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [formAvaliacao, setFormAvaliacao] = useState({ nota: 5, comentario: '', fotos: [], anonimo: false });
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [podeAvaliar, setPodeAvaliar] = useState(false);
  const [lendoFotos, setLendoFotos] = useState(false);
  const [votandoUtil, setVotandoUtil] = useState(null);
  const [erroUtil, setErroUtil] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);

  const { adicionarItem } = useCarrinho();
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const freteVersao = useRef(0);
  const paginaVersao = useRef(0);
  const timerAdicionado = useRef(null);
  const [erroCarrinho, setErroCarrinho] = useState('');
  const tituloErro = useRef(null);
  const botaoAvaliar = useRef(null);
  const primeiroCampoAvaliacao = useRef(null);
  const mensagemAvaliacaoRef = useRef(null);
  // Para onde o foco vai depois de abrir ou fechar o formulário de avaliação (disclosure em linha).
  const focoAvaliacao = useRef(null);

  useEffect(() => {
    let ativo = true;
    paginaVersao.current += 1;
    clearTimeout(timerAdicionado.current);
    setSalvandoAvaliacao(false);
    setLendoFotos(false);
    freteVersao.current += 1;
    setCalculandoFrete(false);
    setErroFrete('');
    setAvisoEstoque('');
    setMensagemAvaliacao('');
    setErroUtil('');
    setVotandoUtil(null);
    setFormAvaliacao({ nota: 5, comentario: '', fotos: [], anonimo: false });
    setAdicionado(false);
    setErroCarrinho('');
    setFormularioAberto(false);
    async function carregar() {
      setCarregando(true);
      setErro('');
      setRelacionados([]);
      setPodeAvaliar(false);
      try {
        const dados = await buscarProduto(id);
        if (!ativo) return;
        setProduto(dados);
        setImagemSelecionada(dados.foto_url || dados.imagens?.[0]?.imagem_url || '');
        setQuantidade(1);
        setVariacaoId('');
        setCorSelecionada('');
        setTamanhoSelecionado('');
        setCotacao(null);

        try {
          const lista = await listarAvaliacoes(id);
          if (!ativo) return;
          setAvaliacoes(lista);
        } catch {
          if (!ativo) return;
          setAvaliacoes([]);
        }

        if (usuario && usuario.perfil !== 'admin') {
          try {
            const permissao = await verificarPermissaoAvaliacao(id);
            if (!ativo) return;
            setPodeAvaliar(Boolean(permissao.pode_avaliar));
          } catch {
            if (!ativo) return;
            setPodeAvaliar(false);
          }
        } else {
          setPodeAvaliar(false);
        }

        if (dados?.categoria) {
          try {
            const produtosRelacionados = await listarProdutos({ categoria: dados.categoria });
            if (!ativo) return;
            setRelacionados(
              produtosRelacionados.filter((item) => String(item.id) !== String(dados.id)).slice(0, 4)
            );
          } catch {
            if (!ativo) return;
            setRelacionados([]);
          }
        } else {
          setRelacionados([]);
        }
      } catch (erro) {
        if (ativo) setErro(erro.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; freteVersao.current += 1; paginaVersao.current += 1; clearTimeout(timerAdicionado.current); };
  }, [id, usuario]);

  // Erro de carregamento: o título recebe o foco (a mensagem é anunciada pela região de alerta).
  useEffect(() => {
    if (erro && !carregando) tituloErro.current?.focus();
  }, [erro, carregando]);

  // Disclosure do formulário de avaliação: ao abrir, foco no primeiro campo; ao fechar, de volta ao botão.
  useEffect(() => {
    const destino = focoAvaliacao.current;
    focoAvaliacao.current = null;
    if (destino === 'campo') primeiroCampoAvaliacao.current?.focus();
    else if (destino === 'botao') botaoAvaliar.current?.focus();
    else if (destino === 'mensagem') mensagemAvaliacaoRef.current?.focus();
  }, [formularioAberto, podeAvaliar]);

  function alternarFormularioAvaliacao() {
    focoAvaliacao.current = formularioAberto ? 'botao' : 'campo';
    setFormularioAberto((aberto) => !aberto);
  }

  function escolherOpcao(cor, tamanho) {
    setCorSelecionada(cor);
    setTamanhoSelecionado(tamanho);
    const tamanhoValido = !produto.tamanhos?.length || produto.tamanhos.includes(tamanho);
    const variacao = tamanhoValido ? (produto.variacoes || []).find(v => v.nome === cor && (v.tamanho || '') === tamanho) : null;
    const somenteTamanhos = !produto.variacoes?.length && produto.tamanhos?.length;
    setVariacaoId(variacao ? String(variacao.id) : (somenteTamanhos && tamanho ? `tamanho:${tamanho}` : ''));
    freteVersao.current += 1;
    setCalculandoFrete(false);
    setQuantidade(1);
    setCotacao(null);
    setAvisoEstoque('');
    setErroCarrinho('');
  }

  function alternarCor(cor) {
    escolherOpcao(corSelecionada === cor ? '' : cor, tamanhoSelecionado);
  }

  function alternarTamanho(tamanho, indisponivel) {
    // Indisponível continua focável (aria-disabled), mas não pode ser escolhido.
    if (indisponivel) return;
    escolherOpcao(corSelecionada, tamanhoSelecionado === tamanho ? '' : tamanho);
  }

  function aoAdicionar() {
    if (produto.ativo === false || Number(produto.ativo) === 0) {
      setErroCarrinho('Este produto está inativo e não pode ser comprado.');
      return;
    }
    let variacao = (produto.variacoes || []).find(
      (item) => String(item.id) === variacaoId
    );
    if (!variacao && variacaoId.startsWith('tamanho:') && !produto.variacoes?.length) {
      variacao = { nome: '', tamanho: variacaoId.split(':')[1], estoque_qtd: produto.estoque_qtd };
    }

    const estoque = Number(variacao ? variacao.estoque_qtd : produto.estoque_qtd);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > estoque || !Number.isFinite(estoque)
      || (produto.tamanhos?.length && !produto.tamanhos.includes(variacao?.tamanho))
      || ((produto.variacoes?.length || produto.tamanhos?.length) && !variacao)) {
      setErroCarrinho('Escolha uma variação e uma quantidade válida dentro do estoque.');
      return;
    }
    setErroCarrinho('');
    adicionarItem(produto, quantidade, variacao || null);

    if (!usuario) {
      navigate('/login', { state: { from: '/carrinho' } });
      return;
    }

    setAdicionado(true);
    clearTimeout(timerAdicionado.current);
    timerAdicionado.current = setTimeout(() => setAdicionado(false), 1200);
  }

  async function calcularFrete(evento) {
    evento.preventDefault();
    setErroFrete('');
    setCotacao(null);

    if (!/^\d{5}-?\d{3}$/.test(cep)) {
      setErroFrete('Informe um CEP válido.');
      return;
    }

    const versao = ++freteVersao.current;
    setCalculandoFrete(true);
    try {
      const resultado = await cotarFrete(cep, [{
        produto_id: produto.id,
        quantidade,
      }]);
      if (versao === freteVersao.current) setCotacao(resultado);
    } catch (erro) {
      if (versao === freteVersao.current) setErroFrete(erro.message);
    } finally {
      if (versao === freteVersao.current) setCalculandoFrete(false);
    }
  }

  async function solicitarAviso() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    const versao = paginaVersao.current;
    try {
      const resposta = await cadastrarAvisoEstoque(produto.id, variacaoSelecionada?.id);
      if (versao === paginaVersao.current) setAvisoEstoque(resposta.mensagem);
    } catch (erroAviso) {
      if (versao === paginaVersao.current) setAvisoEstoque(erroAviso.message);
    }
  }

  async function selecionarFotos(evento) {
    if (lendoFotos || salvandoAvaliacao) return;
    const arquivos = Array.from(evento.target.files || []);
    evento.target.value = '';
    if (arquivos.length + formAvaliacao.fotos.length > 5) {
      setMensagemAvaliacao('Selecione no máximo 5 fotos.');
      return;
    }
    if (arquivos.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 1024 * 1024)) {
      setMensagemAvaliacao('Use fotos JPG, PNG ou WebP de até 1 MB cada.');
      return;
    }
    const versao = paginaVersao.current;
    setLendoFotos(true);
    try {
      const fotos = await Promise.all(arquivos.map(arquivo => new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
      })));
      if (versao !== paginaVersao.current) return;
      setFormAvaliacao(atual => ({ ...atual, fotos: [...atual.fotos, ...fotos].slice(0, 5) }));
      setMensagemAvaliacao('');
    } catch {
      if (versao === paginaVersao.current) setMensagemAvaliacao('Erro ao ler fotos. Tente novamente.');
    } finally {
      if (versao === paginaVersao.current) setLendoFotos(false);
    }
  }

  async function enviarAvaliacao(evento) {
    evento.preventDefault();
    if (lendoFotos || salvandoAvaliacao) return;
    const versao = paginaVersao.current;
    setSalvandoAvaliacao(true);
    setMensagemAvaliacao('');
    try {
      const resposta = await salvarAvaliacao(produto.id, {
        ...formAvaliacao,
        nota: Number(formAvaliacao.nota),
        fotos: formAvaliacao.fotos,
      });
      if (versao !== paginaVersao.current) return;
      setMensagemAvaliacao(resposta.mensagem);
      // O formulário some (já avaliado): o foco vai para a mensagem, sem se perder.
      focoAvaliacao.current = 'mensagem';
      setPodeAvaliar(false);
      setFormularioAberto(false);
      const lista = await listarAvaliacoes(produto.id);
      if (versao !== paginaVersao.current) return;
      setAvaliacoes(lista);
      setFormAvaliacao({ nota: 5, comentario: '', fotos: [], anonimo: false });
    } catch (erroAvaliacao) {
      if (versao === paginaVersao.current) setMensagemAvaliacao(erroAvaliacao.message);
    } finally {
      if (versao === paginaVersao.current) setSalvandoAvaliacao(false);
    }
  }

  async function votarUtil(avaliacaoId) {
    if (!usuario) {
      navigate('/login', { state: { from: '/produto/' + id } });
      return;
    }
    if (votandoUtil !== null) return;
    const versao = paginaVersao.current;
    setVotandoUtil(avaliacaoId);
    setErroUtil('');
    try {
      const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
      const dados = await marcarAvaliacaoUtil(avaliacaoId, !avaliacao?.votou_util);
      if (versao !== paginaVersao.current) return;
      setAvaliacoes(atuais => atuais.map(a => a.id === avaliacaoId ? { ...a, uteis: dados.uteis, votou_util: dados.votou_util } : a));
    } catch (erro) {
      if (versao === paginaVersao.current) setErroUtil(erro.message);
    } finally {
      if (versao === paginaVersao.current) setVotandoUtil(null);
    }
  }

  if (carregando) return <p role="status" className="mt-10 text-center text-texto-secundario">Carregando produto...</p>;
  if (erro) {
    return (
      <div className="mx-auto max-w-xl px-4 py-secao text-center">
        <h1 ref={tituloErro} tabIndex={-1} className="text-titulo-md text-texto outline-none">Produto não encontrado</h1>
        <p role="alert" className="mt-2 text-auxiliar text-texto-secundario">
          Não conseguimos abrir este produto. Ele pode ter sido removido ou estar indisponível.
        </p>
        <Botao para="/" variante="secundario" className="mt-5">Voltar para a loja</Botao>
      </div>
    );
  }
  if (!produto) return null;
  const variacaoSelecionada = (produto.variacoes || []).find((item) => String(item.id) === variacaoId)
    || (variacaoId.startsWith('tamanho:') && !produto.variacoes?.length
      ? { nome: '', tamanho: variacaoId.split(':')[1], estoque_qtd: produto.estoque_qtd }
      : null);
  const estoqueTotalVariacoes = (produto.variacoes || []).reduce((total, variacao) => total + (variacao.ativo === false ? 0 : Number(variacao.estoque_qtd || 0)), 0);
  const estoqueFiltrado = (produto.variacoes || []).filter(variacao =>
    (!corSelecionada || variacao.nome === corSelecionada) &&
    (!tamanhoSelecionado || variacao.tamanho === tamanhoSelecionado)
  ).reduce((total, variacao) => total + Number(variacao.estoque_qtd || 0), 0);
  const estoqueSemSelecao = produto.variacoes?.length ? estoqueTotalVariacoes : Number(produto.estoque_qtd);
  const estoqueDisponivel = variacaoSelecionada ? Number(variacaoSelecionada.estoque_qtd || 0)
    : (corSelecionada || tamanhoSelecionado ? estoqueFiltrado : estoqueSemSelecao);
  const mediaAvaliacoes = avaliacoes.length
    ? avaliacoes.reduce((total, avaliacao) => total + Number(avaliacao.nota), 0) / avaliacoes.length
    : 0;
  const imagensProduto = [produto.foto_url, ...(produto.imagens || []).map((imagem) => imagem.imagem_url)]
    .filter((url, indice, lista) => url && lista.indexOf(url) === indice);
  const indiceImagem = Math.max(imagensProduto.indexOf(imagemSelecionada), 0);
  const coresDisponiveis = [...new Set((produto.variacoes || []).map(v => v.nome).filter(Boolean))];
  const produtoAtivo = produto.ativo !== false && Number(produto.ativo) !== 0;
  const compraBloqueada = !produtoAtivo || estoqueDisponivel === 0;
  const favorito = estaFavorito(produto.id);
  const tamanhos = produto.tamanhos?.length
    ? ORDEM_TAMANHOS.filter((t) => produto.tamanhos.includes(t)).map((tamanho) => {
      const disponivel = produto.variacoes?.length
        ? produto.variacoes.some(v => (!corSelecionada || v.nome === corSelecionada) && v.tamanho === tamanho && Number(v.estoque_qtd) > 0)
        : Number(produto.estoque_qtd) > 0;
      return { tamanho, indisponivel: !disponivel && tamanhoSelecionado !== tamanho };
    })
    : [];
  const motivoTamanhos = textoTamanhosIndisponiveis(tamanhos.filter((t) => t.indisponivel).map((t) => t.tamanho), corSelecionada);
  // Botão de opção (cor ou tamanho): seleção marcada por ícone, contorno duplo e aria-pressed, sem fundo dourado.
  const classeOpcao = (selecionada, indisponivel) => `inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-controle border px-3 text-rotulo ${
    selecionada ? 'border-texto bg-superficie-destaque text-texto ring-1 ring-inset ring-texto'
      : indisponivel ? 'cursor-not-allowed border-dashed border-borda text-texto-discreto line-through'
        : 'border-borda-forte text-texto-secundario hover:border-texto hover:text-texto'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="botao-voltar">
        &larr; Voltar para a loja
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-bloco lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10">
        <figure className="min-w-0">
          <div className="aspect-[4/5] overflow-hidden rounded-painel bg-superficie-elevada">
            {imagemSelecionada
              ? <img src={imagemSelecionada} alt={produto.nome} className="h-full w-full object-contain p-4" />
              : <SemImagem nome={produto.nome} />}
          </div>
          {imagensProduto.length > 1 && (
            <>
              <figcaption className="mt-2 text-legenda text-texto-secundario tabular-nums">Foto {indiceImagem + 1} de {imagensProduto.length}</figcaption>
              <div role="group" aria-label="Fotos do produto" className="mt-3 grid grid-cols-5 gap-2">
                {imagensProduto.map((url, indice) => {
                  const atual = imagemSelecionada === url;
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setImagemSelecionada(url)}
                      aria-pressed={atual}
                      aria-label={`Foto ${indice + 1} de ${imagensProduto.length}`}
                      className={`relative aspect-square overflow-hidden rounded-controle bg-superficie-elevada ${atual ? 'outline outline-2 outline-offset-2 outline-texto' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                      {atual && <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-pilula bg-texto" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </figure>

        <div className="flex min-w-0 flex-col gap-grupo lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="text-auxiliar text-texto-secundario">{produto.categoria}</p>
            <div className="mt-1 flex items-start justify-between gap-4">
              <h1 className="min-w-0 text-titulo-lg text-texto [overflow-wrap:anywhere] [text-wrap:balance]">{produto.nome}</h1>
              {usuario?.perfil !== 'admin' && (
                <BotaoIcone
                  onClick={() => usuario ? alternarFavorito(produto) : navigate('/login')}
                  disabled={!produtoAtivo}
                  variante={favorito ? 'marca' : 'neutro'}
                  rotulo={!produtoAtivo ? 'Produto inativo' : favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  title={!produtoAtivo ? 'Produto inativo' : undefined}
                  className="shrink-0"
                >
                  <IconeCoracao cheio={favorito} />
                </BotaoIcone>
              )}
            </div>
            {avaliacoes.length > 0 && (
              <a href="#avaliacoes" className="mt-2 inline-flex items-center gap-2 text-auxiliar text-texto-secundario hover:text-texto">
                <Estrelas valor={mediaAvaliacoes} quantidade={avaliacoes.length} />
                <span aria-hidden="true">{formatarNota(mediaAvaliacoes)} · {textoAvaliacoes(avaliacoes.length)}</span>
              </a>
            )}
          </div>

          <Superficie espacamento="padrao" className="flex flex-col gap-grupo">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <Preco valor={produto.preco} tamanho="destaque" as="p" className="text-marca" />
              {!produtoAtivo ? (
                <p className="inline-flex items-center gap-1.5 text-rotulo text-erro-texto"><IconeAlerta tamanho={16} />Produto inativo e indisponível para compra</p>
              ) : estoqueDisponivel > 0 ? (
                <p className="inline-flex items-center gap-1.5 text-rotulo text-sucesso-texto"><IconeCheck tamanho={16} />Em estoque ({estoqueDisponivel} disponíveis)</p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-rotulo text-aviso-texto"><IconeAlerta tamanho={16} />Sem estoque</p>
              )}
            </div>

            {coresDisponiveis.length > 0 && (
              <fieldset>
                <legend className="text-rotulo text-texto">
                  Cor{corSelecionada && <span className="font-normal text-texto-secundario"> · {corSelecionada}</span>}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {coresDisponiveis.map(cor => (
                    <button key={cor} type="button" aria-pressed={corSelecionada === cor} onClick={() => alternarCor(cor)} className={classeOpcao(corSelecionada === cor, false)}>
                      {corSelecionada === cor && <IconeCheck tamanho={14} />}{cor}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {tamanhos.length > 0 && (
              <fieldset>
                <legend className="text-rotulo text-texto">
                  Tamanho{tamanhoSelecionado && <span className="font-normal text-texto-secundario"> · {tamanhoSelecionado}</span>}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tamanhos.map(({ tamanho, indisponivel }) => (
                    <button
                      key={tamanho}
                      type="button"
                      aria-pressed={tamanhoSelecionado === tamanho}
                      aria-disabled={indisponivel || undefined}
                      aria-describedby={indisponivel ? 'tamanhos-indisponiveis' : undefined}
                      onClick={() => alternarTamanho(tamanho, indisponivel)}
                      className={classeOpcao(tamanhoSelecionado === tamanho, indisponivel)}
                    >
                      {tamanhoSelecionado === tamanho && <IconeCheck tamanho={14} />}{tamanho}
                    </button>
                  ))}
                </div>
                <p id="tamanhos-indisponiveis" className={motivoTamanhos ? 'mt-2 text-legenda text-texto-secundario' : ''}>{motivoTamanhos}</p>
              </fieldset>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <Campo
                id="produto-quantidade"
                name="quantidade"
                rotulo="Quantidade"
                inputMode="numeric"
                type="number"
                min="1"
                max={estoqueDisponivel}
                disabled={compraBloqueada}
                value={quantidade}
                onChange={(e) => {
                  const novaQuantidade = Number(e.target.value);
                  setQuantidade(Math.min(Math.max(Math.trunc(novaQuantidade) || 1, 1), estoqueDisponivel));
                  setCotacao(null);
                  freteVersao.current += 1;
                  setCalculandoFrete(false);
                }}
                className="w-24 shrink-0"
                classeControle="text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Botao
                tamanho="lg"
                onClick={aoAdicionar}
                disabled={compraBloqueada}
                iconeAntes={adicionado ? <IconeCheck /> : null}
                className="min-w-[15rem] flex-1"
              >
                {adicionado ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}
              </Botao>
            </div>
            {/* Região estável: o anúncio não depende de animação nem da troca de texto do botão. */}
            <p role="status" className="sr-only">{adicionado ? 'Produto adicionado ao carrinho.' : ''}</p>

            {erroCarrinho && <p role="alert" className="text-sm text-erro">{erroCarrinho}</p>}

            {produtoAtivo && ((produto.variacoes?.length > 0 && variacaoSelecionada && estoqueDisponivel === 0)
              || (!produto.variacoes?.length && estoqueDisponivel === 0)) && (
                <Botao variante="secundario" tamanho="lg" larguraTotal onClick={solicitarAviso}>
                  Avise-me quando estiver disponível
                </Botao>
              )}
            <p role="status" className={avisoEstoque ? 'text-center text-sm text-texto-secundario' : ''}>{avisoEstoque}</p>

            <div className="border-t border-divisor pt-4">
              <h2 className="mb-3 text-rotulo text-texto">Calcular entrega</h2>
              {usuario ? (
                <form onSubmit={calcularFrete} className="flex items-end gap-2">
                  <Campo
                    id="frete-cep"
                    rotulo="CEP de entrega"
                    className="min-w-0 flex-1"
                    type="text"
                    inputMode="numeric"
                    value={cep}
                    onChange={(evento) => {
                      const numeros = evento.target.value.replace(/\D/g, '').slice(0, 8);
                      freteVersao.current += 1;
                      setCotacao(null);
                      setErroFrete('');
                      setCalculandoFrete(false);
                      setCep(numeros.replace(/^(\d{5})(\d)/, '$1-$2'));
                    }}
                    name="cep"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    aria-invalid={erroFrete ? 'true' : undefined}
                    aria-describedby={erroFrete ? 'frete-erro' : undefined}
                  />
                  <Botao type="submit" variante="secundario" carregando={calculandoFrete}>
                    {calculandoFrete ? 'Calculando...' : 'Calcular'}
                  </Botao>
                </form>
              ) : (
                <p className="text-sm text-texto-secundario">
                  <Link to="/login" className="text-link underline underline-offset-2">Entre na sua conta</Link>{' '}
                  para calcular o prazo e o valor da entrega.
                </p>
              )}

              <p id="frete-erro" role="alert" className={erroFrete ? 'mt-2 text-sm text-erro' : ''}>{erroFrete}</p>
              {Boolean(cotacao?.gratuito) && (
                <p className="mt-3 rounded-cartao border border-sucesso-borda bg-sucesso-fundo p-3 text-sm font-semibold text-sucesso-texto">
                  Entrega grátis
                </p>
              )}
              {cotacao && !cotacao.gratuito && (
                <ul className="mt-2 divide-y divide-divisor">
                  {(cotacao.opcoes || [cotacao]).map((opcao) => (
                    <li key={opcao.servico_id} className="flex items-baseline justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-texto">
                          {opcao.nome_exibicao || `${opcao.transportadora} - ${opcao.servico_nome}`}
                        </p>
                        <p className="text-texto-secundario">Até {opcao.prazo_dias} dias</p>
                      </div>
                      <Preco valor={opcao.valor} as="strong" className="shrink-0 text-texto" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Superficie>

          <ul className="space-y-2 text-auxiliar text-texto-secundario">
            <li className="flex items-start gap-2"><IconeEscudo tamanho={16} className="mt-0.5 shrink-0" />Pagamento processado em ambiente seguro</li>
            <li className="flex items-start gap-2"><IconeCaminhao tamanho={16} className="mt-0.5 shrink-0" />Estoque confirmado antes da finalização</li>
            <li className="flex items-start gap-2"><IconeTroca tamanho={16} className="mt-0.5 shrink-0" />Trocas e devoluções conforme a política da loja</li>
          </ul>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 border-t border-divisor pt-4 text-auxiliar">
            {produto.categoria && <><dt className="text-texto-secundario">Categoria</dt><dd className="text-texto">{produto.categoria}</dd></>}
            {coresDisponiveis.length > 0 && <><dt className="text-texto-secundario">Cores</dt><dd className="text-texto">{coresDisponiveis.join(', ')}</dd></>}
            {tamanhos.length > 0 && <><dt className="text-texto-secundario">Tamanhos</dt><dd className="text-texto">{tamanhos.map((t) => t.tamanho).join(', ')}</dd></>}
          </dl>
        </div>
      </div>

      <section id="avaliacoes" aria-labelledby="titulo-avaliacoes" className="mt-secao grid gap-bloco border-t border-divisor pt-bloco lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="min-w-0">
          <h2 id="titulo-avaliacoes" className="text-titulo-md text-texto">Avaliações</h2>
          {avaliacoes.length > 0 ? (
            <div className="mt-4">
              <p className="flex items-baseline gap-2" aria-hidden="true">
                <span className="text-titulo-lg text-texto tabular-nums">{formatarNota(mediaAvaliacoes)}</span>
                <span className="text-auxiliar text-texto-secundario">de 5</span>
              </p>
              <Estrelas valor={mediaAvaliacoes} quantidade={avaliacoes.length} tamanho={18} className="mt-2" />
              <p className="mt-2 text-auxiliar text-texto-secundario" aria-hidden="true">{textoAvaliacoes(avaliacoes.length)}</p>
            </div>
          ) : (
            <p className="mt-3 text-auxiliar text-texto-secundario">Ainda sem avaliações</p>
          )}

          {Boolean(podeAvaliar) && (
            <Botao
              ref={botaoAvaliar}
              variante="secundario"
              className="mt-5"
              aria-expanded={formularioAberto}
              aria-controls="formulario-avaliacao"
              onClick={alternarFormularioAvaliacao}
            >
              Avaliar este produto
            </Botao>
          )}
          <div id="formulario-avaliacao" hidden={!(podeAvaliar && formularioAberto)}>
            {Boolean(podeAvaliar) && formularioAberto && (
              <form onSubmit={enviarAvaliacao} className="mt-5 grid gap-4">
                <Campo
                  ref={primeiroCampoAvaliacao}
                  as="select"
                  id="avaliacao-nota"
                  rotulo="Nota"
                  name="nota"
                  value={formAvaliacao.nota}
                  onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, nota: evento.target.value })}
                >
                  {/* <option> não aceita SVG: a nota fica por extenso. */}
                  {[5, 4, 3, 2, 1].map((nota) => <option key={nota} value={nota}>{nota} {nota === 1 ? 'estrela' : 'estrelas'}</option>)}
                </Campo>
                <Campo
                  as="textarea"
                  id="avaliacao-comentario"
                  rotulo="Comentário"
                  name="comentario"
                  required
                  maxLength="1000"
                  value={formAvaliacao.comentario}
                  onChange={(evento) => setFormAvaliacao({ ...formAvaliacao, comentario: evento.target.value })}
                  placeholder="Conte como foi sua experiência"
                />
                <div>
                  <label htmlFor="fotos-avaliacao" className="block text-rotulo text-texto">
                    Compartilhe suas fotos (opcional)
                  </label>
                  {/* O input fica visualmente oculto, antes do rótulo visível, que mostra o foco do teclado (peer-focus-visible). */}
                  <input
                    id="fotos-avaliacao"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={selecionarFotos}
                    disabled={lendoFotos || salvandoAvaliacao || formAvaliacao.fotos.length >= 5}
                    aria-describedby="fotos-avaliacao-ajuda"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="fotos-avaliacao"
                    className="mt-2 flex h-20 cursor-pointer items-center justify-center gap-2 rounded-controle border border-dashed border-borda-forte bg-campo text-auxiliar text-marca hover:border-marca peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                  >
                    <IconeCamera tamanho={24} />
                    Adicionar fotos
                  </label>
                  <p id="fotos-avaliacao-ajuda" className="mt-2 text-xs text-texto-secundario">
                    {formAvaliacao.fotos.length} de 5 fotos · JPG, PNG ou WebP de até 1 MB cada
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {formAvaliacao.fotos.map((foto, indice) => (
                      <div key={indice} className="relative">
                        <img src={foto} alt={'Foto selecionada ' + (indice + 1)} className="h-20 w-20 rounded object-cover" />
                        <BotaoIcone tamanho="sm" disabled={salvandoAvaliacao} onClick={() => setFormAvaliacao(atual => ({ ...atual, fotos: atual.fotos.filter((_, i) => i !== indice) }))} rotulo={'Remover foto ' + (indice + 1)} className="absolute -right-3 -top-3">×</BotaoIcone>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formAvaliacao.anonimo} onChange={evento => setFormAvaliacao(atual => ({ ...atual, anonimo: evento.target.checked }))} className="accent-marca" />
                  Publicar como Anônimo
                </label>
                <div className="flex flex-wrap gap-3">
                  <Botao type="submit" tamanho="lg" carregando={salvandoAvaliacao} disabled={lendoFotos}>
                    {salvandoAvaliacao ? 'Salvando...' : 'Publicar avaliação'}
                  </Botao>
                  <Botao variante="discreto" tamanho="lg" onClick={alternarFormularioAvaliacao}>Cancelar</Botao>
                </div>
              </form>
            )}
          </div>
          <p ref={mensagemAvaliacaoRef} tabIndex={-1} role="status" className={mensagemAvaliacao ? 'mt-3 text-sm text-texto outline-none' : 'outline-none'}>{mensagemAvaliacao}</p>
        </div>

        <div className="min-w-0">
          {avaliacoes.length > 0 && (
            <ul className="divide-y divide-divisor">
              {avaliacoes.map((avaliacao) => (
                <li key={avaliacao.id} className="py-5 first:pt-0">
                  <article>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-texto">{avaliacao.usuario_nome}</h3>
                      <Estrelas valor={avaliacao.nota} />
                    </div>
                    {avaliacao.comentario && <p className="mt-2 max-w-[65ch] text-auxiliar text-texto-secundario [text-wrap:pretty]">{avaliacao.comentario}</p>}
                    {avaliacao.fotos?.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {avaliacao.fotos.map((foto, indice) => <img key={indice} src={foto} alt={'Foto da avaliação ' + (indice + 1)} loading="lazy" className="aspect-square w-full rounded-controle object-cover" />)}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <time className="text-legenda text-texto-discreto">{new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}</time>
                      <Botao
                        variante={avaliacao.votou_util ? 'secundario' : 'discreto'}
                        tamanho="sm"
                        onClick={() => votarUtil(avaliacao.id)}
                        aria-pressed={Boolean(avaliacao.votou_util)}
                        disabled={votandoUtil !== null}
                        iconeAntes={<IconeUtil tamanho={16} />}
                      >
                        {/* Um só item flexível: o gap do Botao não separa os parênteses do número. */}
                        <span>Útil (<span className="tabular-nums">{Number(avaliacao.uteis || 0)}</span>)</span>
                      </Botao>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
          {erroUtil && <p role="alert" className="mt-3 text-sm text-erro">{erroUtil}</p>}
        </div>
      </section>

      <PerguntasProduto produtoId={id} />

      {relacionados.length > 0 && (
        <section aria-labelledby="titulo-relacionados" className="mt-secao border-t border-divisor pt-bloco">
          <h2 id="titulo-relacionados" className="mb-5 text-titulo-md text-texto">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {relacionados.map((item) => (
              <CartaoProduto key={item.id} produto={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
