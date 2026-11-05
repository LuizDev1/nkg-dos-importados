const SUCESSO = new Set(['ativo', 'ativa', 'pago', 'aprovado', 'concluido', 'concluida', 'entregue', 'reembolsado']);
const ERRO = new Set(['cancelado', 'cancelada', 'inativo', 'inativa', 'bloqueado', 'bloqueada', 'recusado', 'falha', 'rejeitado']);

export function corStatus(status) {
  const valor = String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (SUCESSO.has(valor)) return 'status-verde';
  if (ERRO.has(valor)) return 'status-vermelho';
  return 'status-amarelo';
}

// Rótulos da área do cliente (mesmos textos que as telas já exibiam), agora num lugar só.
export const ROTULOS_PAGAMENTO_CLIENTE = {
  pendente: 'Aguardando pagamento',
  pago: 'Pagamento aprovado',
  recusado: 'Pagamento recusado',
  cancelado: 'Cancelado',
};

export const ROTULOS_PEDIDO = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pagamento aprovado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  reembolso_pendente: 'Reembolso pendente',
  reembolsado: 'Reembolsado',
};
