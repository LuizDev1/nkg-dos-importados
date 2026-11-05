// Regras de apresentação do produto (sem regra de negócio): textos e estados exibidos na vitrine.
// Módulo puro (.mjs) para ser testado pelo node:test.

const LISTA = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });

// Nota média com uma casa decimal e vírgula: 4.7 → "4,7".
export function formatarNota(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '';
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// "1 avaliação", "2 avaliações". Singular só para 1: o Intl.PluralRules do pt-BR também põe o 0 no
// singular (regra do CLDR), mas na interface o usual é "0 avaliações".
export function textoAvaliacoes(quantidade) {
  const n = Number(quantidade) || 0;
  return `${n} ${n === 1 ? 'avaliação' : 'avaliações'}`;
}

// Texto acessível completo de uma nota: "Nota 4,7 de 5, 3 avaliações" ou "Nota 5 de 5".
export function textoNota(valor, quantidade) {
  const numero = Number(valor);
  const nota = Number.isInteger(numero) && quantidade === undefined ? String(numero) : formatarNota(numero);
  return quantidade === undefined ? `Nota ${nota} de 5` : `Nota ${nota} de 5, ${textoAvaliacoes(quantidade)}`;
}

// Preenchimento proporcional das estrelas, em % (0 a 100, duas casas): 4.7 de 5 → 94.
export function preenchimentoNota(valor, maximo = 5) {
  const nota = Number(valor);
  const teto = Number(maximo);
  if (!Number.isFinite(nota) || !Number.isFinite(teto) || teto <= 0) return 0;
  const fracao = Math.min(Math.max(nota / teto, 0), 1);
  return Math.round(fracao * 10000) / 100;
}

// Estoque mostrado no card, sem expor quantidade: 'sem' (zerado), 'baixo' (até o estoque mínimo) ou null.
export function estoqueDoCartao(produto) {
  const quantidade = Number(produto?.estoque_qtd);
  if (!Number.isFinite(quantidade)) return null;
  if (quantidade <= 0) return 'sem';
  const minimo = Number(produto?.estoque_minimo);
  if (Number.isFinite(minimo) && quantidade <= minimo) return 'baixo';
  return null;
}

// Motivo visível dos tamanhos indisponíveis: "Tamanho M indisponível para a cor preta."
export function textoTamanhosIndisponiveis(tamanhos, cor) {
  const lista = (tamanhos || []).filter(Boolean);
  if (!lista.length) return '';
  const nomes = LISTA.format(lista);
  const sujeito = lista.length === 1 ? `Tamanho ${nomes} indisponível` : `Tamanhos ${nomes} indisponíveis`;
  return cor ? `${sujeito} para a cor ${String(cor).toLocaleLowerCase('pt-BR')}.` : `${sujeito}.`;
}
