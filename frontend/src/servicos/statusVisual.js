const SUCESSO = new Set(['ativo', 'ativa', 'pago', 'aprovado', 'concluido', 'concluida', 'entregue', 'reembolsado']);
const ERRO = new Set(['cancelado', 'cancelada', 'inativo', 'inativa', 'bloqueado', 'bloqueada', 'recusado', 'falha', 'rejeitado']);

export function corStatus(status) {
  const valor = String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (SUCESSO.has(valor)) return 'status-verde';
  if (ERRO.has(valor)) return 'status-vermelho';
  return 'status-amarelo';
}
