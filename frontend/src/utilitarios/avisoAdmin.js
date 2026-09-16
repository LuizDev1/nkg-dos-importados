export function avisarAdmin(mensagem) {
  window.dispatchEvent(new CustomEvent('admin:aviso', { detail: mensagem }));
}
