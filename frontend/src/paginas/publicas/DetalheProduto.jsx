import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { buscarProduto, listarProdutos } from '../../servicos/produtoService';
import { cotarFrete } from '../../servicos/freteService';
import { useCarrinho } from '../../contextos/ContextoCarrinho';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import CartaoProduto from '../../componentes/CartaoProduto';

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

  const { adicionarItem } = useCarrinho();
  const { usuario } = useAutenticacao();

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro('');
      setRelacionados([]);
      try {
        const dados = await buscarProduto(id);
        setProduto(dados);
        setQuantidade(1);
        setCotacao(null);

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
  }, [id]);

  function aoAdicionar() {
    adicionarItem(produto, quantidade);
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

  if (carregando) return <p className="text-center mt-10">Carregando produto...</p>;
  if (erro) return <p className="text-center mt-10 text-red-600">{erro}</p>;
  if (!produto) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        &larr; Voltar para a loja
      </Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={produto.foto_url || 'https://placehold.co/400'}
          alt={produto.nome}
          className="w-full h-80 object-cover rounded-lg"
        />

        <div>
          <h1 className="text-2xl font-bold mb-2">{produto.nome}</h1>
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

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={produto.estoque_qtd}
              value={quantidade}
              onChange={(e) => {
                const novaQuantidade = Number(e.target.value);
                setQuantidade(Math.min(Math.max(novaQuantidade || 1, 1), produto.estoque_qtd));
                setCotacao(null);
              }}
              className="w-20 border rounded px-2 py-1 text-center"
            />
          </div>

          <button
            onClick={aoAdicionar}
            disabled={produto.estoque_qtd === 0}
            className={`w-full py-3 rounded transition ${
              adicionado
                ? 'bg-green-600 text-white'
                : produto.estoque_qtd === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {adicionado ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </button>

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
