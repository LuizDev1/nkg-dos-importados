// Classes dos componentes base, só com tokens de index.css. Módulo puro (sem JSX) para poder ser testado.
// Sem transições novas: o projeto já tem a regra global de transição de button/a em index.css.

const juntar = (...partes) => partes.filter(Boolean).join(' ');

export const BOTAO_VARIANTES = {
  primario: 'bg-marca text-texto-inverso hover:bg-marca-hover active:bg-marca-ativo',
  secundario: 'border border-marca text-marca hover:bg-marca-suave active:bg-marca-suave',
  discreto: 'text-marca hover:bg-marca-suave active:bg-marca-suave',
  destrutivo: 'border border-erro-borda text-erro hover:bg-erro-fundo active:bg-erro-fundo',
};

// Altura mínima: sm 36 px (ações densas de tabela, acima dos 24 px do WCAG 2.5.8), md 44 px, lg 48 px.
export const BOTAO_TAMANHOS = {
  sm: 'min-h-9 px-3 text-rotulo',
  md: 'min-h-11 px-5 text-rotulo',
  lg: 'min-h-12 px-6 text-corpo font-bold',
};

export function classesBotao({ variante = 'primario', tamanho = 'md', larguraTotal = false } = {}) {
  return juntar(
    'inline-flex items-center justify-center gap-2 rounded-controle text-center font-semibold no-underline',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    BOTAO_VARIANTES[variante] || BOTAO_VARIANTES.primario,
    BOTAO_TAMANHOS[tamanho] || BOTAO_TAMANHOS.md,
    larguraTotal && 'w-full',
  );
}

export const BOTAO_ICONE_TAMANHOS = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base' };
export const BOTAO_ICONE_VARIANTES = {
  neutro: 'border-borda bg-fundo/70 text-texto hover:border-marca hover:text-marca',
  marca: 'border-marca bg-marca text-texto-inverso hover:bg-marca-hover',
};

export function classesBotaoIcone({ tamanho = 'md', variante = 'neutro' } = {}) {
  return juntar(
    'inline-flex shrink-0 items-center justify-center rounded-pilula border',
    'disabled:cursor-not-allowed disabled:opacity-40',
    BOTAO_ICONE_TAMANHOS[tamanho] || BOTAO_ICONE_TAMANHOS.md,
    BOTAO_ICONE_VARIANTES[variante] || BOTAO_ICONE_VARIANTES.neutro,
  );
}

// Campos: 16 px no celular (evita o zoom do iOS), 14 px a partir de sm. Borda borda-forte: 3,26–3,85:1 (WCAG 1.4.11).
export function classesCampo({ as = 'input' } = {}) {
  return juntar(
    'w-full rounded-controle border border-borda-forte bg-campo px-3 py-2.5 text-base text-texto sm:text-sm',
    'placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60',
    as === 'textarea' && 'min-h-24',
  );
}
export const CAMPO_ROTULO = 'mb-1.5 block text-rotulo text-texto';
export const CAMPO_OPCIONAL = 'font-normal text-texto-discreto';
export const CAMPO_AJUDA = 'mt-1.5 text-auxiliar text-texto-secundario';
export const CAMPO_ERRO = 'mt-1.5 text-auxiliar text-erro';

export const SUPERFICIE_NIVEIS = { base: 'bg-superficie', elevada: 'bg-superficie-elevada', destaque: 'bg-superficie-destaque' };
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
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-pilula border px-2.5 py-0.5 text-legenda font-semibold',
    SELO_TONS[tom] || SELO_TONS.neutro,
  );
}

// Tom visual de um status real (pedido, pagamento, estoque, cadastro). Só apresentação: nenhuma regra de negócio.
const TONS_STATUS = {
  sucesso: ['ativo', 'ativa', 'pago', 'aprovado', 'concluido', 'concluida', 'entregue', 'reembolsado', 'em_estoque'],
  erro: ['cancelado', 'cancelada', 'inativo', 'inativa', 'bloqueado', 'bloqueada', 'recusado', 'falha', 'rejeitado', 'sem_estoque'],
  aviso: ['pendente', 'aguardando_pagamento', 'reembolso_pendente', 'estoque_baixo'],
  info: ['em_preparacao', 'enviado'],
};

export function tomDoStatus(status) {
  const valor = String(status ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  for (const [tom, lista] of Object.entries(TONS_STATUS)) if (lista.includes(valor)) return tom;
  return 'neutro';
}

export const PRECO_TAMANHOS = { herdar: '', padrao: 'text-preco', destaque: 'text-preco-destaque' };
