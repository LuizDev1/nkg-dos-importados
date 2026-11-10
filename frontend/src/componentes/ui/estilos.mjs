// Classes dos componentes base, só com tokens de index.css. Módulo puro (sem JSX) para poder ser testado.
// Transições e pressão (0,97) vêm da regra global de button/a em index.css. Direção 2 v2.

const juntar = (...partes) => partes.filter(Boolean).join(' ');

export const BOTAO_VARIANTES = {
  primario: 'border-transparent bg-marca text-texto-inverso hover:bg-marca-hover active:bg-marca-ativo',
  secundario: 'border-borda-destaque bg-superficie text-texto hover:bg-superficie-elevada active:bg-superficie-destaque',
  discreto: 'border-transparent text-texto hover:bg-superficie-elevada active:bg-superficie-destaque',
  destrutivo: 'border-erro-borda bg-superficie text-erro hover:bg-erro-fundo active:bg-erro-fundo',
};

// Altura mínima: sm 36 px (ações densas de tabela, acima dos 24 px do WCAG 2.5.8), md 44 px, lg 48 px.
export const BOTAO_TAMANHOS = {
  sm: 'min-h-9 px-3 text-rotulo',
  md: 'min-h-11 px-4 text-rotulo',
  lg: 'min-h-12 px-5 text-corpo font-semibold',
};

export function classesBotao({ variante = 'primario', tamanho = 'md', larguraTotal = false } = {}) {
  return juntar(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-controle border text-center font-semibold no-underline',
    // Desabilitado igual ao Figma: neutro, sem dourado. Interativa a 50% resulta no #f5f5f5 do Figma; sem pressão.
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-superficie-destaque disabled:text-texto disabled:opacity-50',
    'aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-superficie-destaque aria-disabled:text-texto aria-disabled:opacity-50',
    BOTAO_VARIANTES[variante] || BOTAO_VARIANTES.primario,
    BOTAO_TAMANHOS[tamanho] || BOTAO_TAMANHOS.md,
    larguraTotal && 'w-full',
  );
}

// sm 32 px (sobre fotos, acima dos 24 px do WCAG 2.5.8), md 40 px, lg 44 px (barras de ação).
export const BOTAO_ICONE_TAMANHOS = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-11 w-11 text-base' };
// neutro: fundo sólido, legível sobre foto. fantasma: barra de ícones. contorno: ação isolada com limite visível.
export const BOTAO_ICONE_VARIANTES = {
  neutro: 'border-borda-destaque bg-superficie text-texto hover:bg-superficie-elevada',
  fantasma: 'border-transparent text-texto hover:bg-superficie-elevada',
  contorno: 'border-borda-forte bg-superficie text-texto hover:bg-superficie-elevada',
  marca: 'border-marca bg-marca text-texto-inverso hover:bg-marca-hover',
};

export function classesBotaoIcone({ tamanho = 'md', variante = 'neutro' } = {}) {
  return juntar(
    'inline-flex shrink-0 items-center justify-center rounded-controle border',
    'disabled:cursor-not-allowed disabled:opacity-40',
    BOTAO_ICONE_TAMANHOS[tamanho] || BOTAO_ICONE_TAMANHOS.md,
    BOTAO_ICONE_VARIANTES[variante] || BOTAO_ICONE_VARIANTES.neutro,
  );
}

// Campos: 16 px no celular (evita o zoom do iOS), 14 px a partir de sm. Borda borda-forte = control-border:
// claro #858585 (3,10–3,69:1), escuro oklch(0.6 0 0) (3,21–5,01:1) em todas as superfícies (WCAG 1.4.11).
export function classesCampo({ as = 'input' } = {}) {
  return juntar(
    'min-h-11 w-full rounded-controle border border-borda-forte bg-campo px-3 py-2.5 text-base text-texto sm:text-sm',
    'placeholder:text-placeholder disabled:cursor-not-allowed',
    as === 'textarea' && 'min-h-24',
  );
}
export const CAMPO_ROTULO = 'mb-1.5 block text-auxiliar font-medium text-texto';
export const CAMPO_OPCIONAL = 'font-normal text-texto-discreto';
export const CAMPO_AJUDA = 'mt-1.5 text-auxiliar text-texto-secundario';
export const CAMPO_ERRO = 'mt-1.5 flex items-start gap-1.5 text-auxiliar font-medium text-erro';

// "destaque" usa o auxiliar: a superfície interativa (superficie-destaque) fica só para hover e seleção.
export const SUPERFICIE_NIVEIS = { base: 'bg-superficie', elevada: 'bg-superficie-elevada', destaque: 'bg-superficie-elevada' };
export const SUPERFICIE_ESPACOS = { nenhum: '', compacto: 'p-4', padrao: 'p-5 sm:p-6', amplo: 'p-6 sm:p-8' };

export function classesSuperficie({ nivel = 'base', espacamento = 'padrao', borda = true, sombra = false } = {}) {
  return juntar(
    'rounded-cartao',
    SUPERFICIE_NIVEIS[nivel] || SUPERFICIE_NIVEIS.base,
    SUPERFICIE_ESPACOS[espacamento] ?? SUPERFICIE_ESPACOS.padrao,
    borda && 'border border-borda',
    sombra && 'shadow-nivel-2',
  );
}

export const SELO_TONS = {
  sucesso: 'border-sucesso-borda bg-sucesso-fundo text-sucesso-texto',
  aviso: 'border-aviso-borda bg-aviso-fundo text-aviso-texto',
  erro: 'border-erro-borda bg-erro-fundo text-erro-texto',
  info: 'border-info-borda bg-info-fundo text-info-texto',
  neutro: 'border-borda bg-superficie-elevada text-texto-secundario',
};

export function classesSelo(tom = 'neutro') {
  return juntar(
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-pequeno border px-2 py-0.5 text-legenda font-semibold',
    SELO_TONS[tom] || SELO_TONS.neutro,
  );
}

// Tom visual de um status real (pedido, pagamento, estoque, cadastro). Só apresentação: nenhuma regra de negócio.
const TONS_STATUS = {
  sucesso: ['ativo', 'ativa', 'pago', 'aprovado', 'concluido', 'concluida', 'entregue', 'reembolsado', 'em_estoque'],
  erro: ['cancelado', 'cancelada', 'inativo', 'inativa', 'bloqueado', 'bloqueada', 'recusado', 'falha', 'rejeitado', 'sem_estoque'],
  // Em preparação e enviado seguem como aviso, igual a corStatus() (usado no select do admin): mesmo tom para cliente e admin.
  aviso: ['pendente', 'aguardando_pagamento', 'reembolso_pendente', 'estoque_baixo', 'em_preparacao', 'enviado'],
};

export function tomDoStatus(status) {
  const valor = String(status ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  for (const [tom, lista] of Object.entries(TONS_STATUS)) if (lista.includes(valor)) return tom;
  return 'neutro';
}

// Fase 1B: painéis flutuantes (menu, seletor, popover) e seus itens. O movimento fica nas classes mov-* de index.css.
export const PAINEL_FLUTUANTE = 'z-(--z-flutuante) rounded-cartao border border-borda bg-superficie text-texto shadow-nivel-2 outline-none';
// Item realçado: fundo da superfície interativa; no teclado, também o contorno de foco (regra em index.css).
// Cor e realce ficam só na variante, sem classes concorrentes (no Tailwind, a ordem do CSS gerado decide o empate).
const ITEM_LISTA_BASE = 'item-lista relative flex min-h-10 cursor-default select-none items-center gap-2 rounded-pequeno py-2 text-auxiliar outline-none data-disabled:pointer-events-none data-disabled:opacity-50';
const ITEM_LISTA_TONS = {
  neutro: 'text-texto data-highlighted:bg-superficie-destaque',
  destrutivo: 'text-erro data-highlighted:bg-erro-fundo',
};
// `indicador`: lado reservado para a marca de seleção (seletor: direita; opção marcável: esquerda).
const ITEM_LISTA_RECUOS = { nenhum: 'px-2.5', direita: 'pl-2.5 pr-8', esquerda: 'pl-8 pr-2.5' };
export function classesItemLista({ destrutivo = false, indicador = 'nenhum' } = {}) {
  return juntar(ITEM_LISTA_BASE, ITEM_LISTA_TONS[destrutivo ? 'destrutivo' : 'neutro'], ITEM_LISTA_RECUOS[indicador] || ITEM_LISTA_RECUOS.nenhum);
}
export const ROTULO_LISTA = 'px-2.5 pb-1 pt-2 text-legenda font-semibold text-texto-secundario';
export const SEPARADOR_LISTA = '-mx-1 my-1 h-px bg-borda';

export const PRECO_TAMANHOS ={ herdar: '', padrao: 'text-preco', destaque: 'text-preco-destaque' };
