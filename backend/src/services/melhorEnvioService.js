const pool = require('../config/banco');

const CEP_ORIGEM = String(process.env.CEP_ORIGEM || '64900000').replace(/\D/g, '');
const API_URL = process.env.MELHOR_ENVIO_API_URL
  || 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

function normalizarCep(cep) {
  return String(cep || '').replace(/\D/g, '');
}

async function cotar({ cepDestino, itens, servicoId = null }) {
  const destino = normalizarCep(cepDestino);
  if (!/^\d{8}$/.test(destino)) throw new Error('CEP de destino inválido');

  if (destino === CEP_ORIGEM) {
    return {
      gratuito: true,
      valor: 0,
      prazo_dias: 0,
      servico_id: 'gratis-mesmo-cep',
      servico_nome: 'Entrega grátis para o mesmo CEP',
    };
  }

  if (!process.env.MELHOR_ENVIO_TOKEN) {
    throw new Error('MELHOR_ENVIO_TOKEN não configurado');
  }

  const ids = itens.map((item) => Number(item.produto_id));
  const [produtos] = await pool.query(
    `SELECT id, nome, preco, peso_kg, largura_cm, altura_cm, comprimento_cm
     FROM produtos WHERE id IN (?) AND ativo = TRUE`,
    [ids]
  );
  const porId = new Map(produtos.map((produto) => [produto.id, produto]));

  const products = itens.map((item) => {
    const produto = porId.get(Number(item.produto_id));
    if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado`);
    return {
      name: produto.nome,
      quantity: Number(item.quantidade),
      unitary_value: Number(produto.preco),
      weight: Number(produto.peso_kg),
      width: Number(produto.largura_cm),
      height: Number(produto.altura_cm),
      length: Number(produto.comprimento_cm),
    };
  });

  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
      'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT || 'NKG-dos-Importados/1.0',
    },
    body: JSON.stringify({
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: destino },
      products,
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    const detalhe = dados.message || dados.error || dados.errors
      ? JSON.stringify(dados.errors || dados.message || dados.error)
      : 'verifique o token e as permissões da conta';
    throw new Error(`Melhor Envio (${resposta.status}) não conseguiu calcular o frete: ${detalhe}`);
  }

  const opcoes = (Array.isArray(dados) ? dados : dados.data || [])
    .filter((opcao) => !opcao.error && Number.isFinite(Number(opcao.price)))
    .map((opcao) => ({
      servico_id: String(opcao.id),
      servico_nome: opcao.name || opcao.company?.name || 'Entrega',
      valor: Number(opcao.price),
      prazo_dias: Number(opcao.delivery_time || opcao.delivery_range?.max || 0),
    }))
    .sort((a, b) => a.valor - b.valor);

  const escolhida = servicoId
    ? opcoes.find((opcao) => opcao.servico_id === String(servicoId))
    : opcoes[0];
  if (!escolhida) throw new Error('Nenhuma opção de frete disponível para este destino');
  return { gratuito: false, opcoes, ...escolhida };
}

module.exports = { cotar, normalizarCep, CEP_ORIGEM };