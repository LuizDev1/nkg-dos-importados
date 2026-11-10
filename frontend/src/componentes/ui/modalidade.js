// Última forma de entrada usada (teclado ou ponteiro), em <html data-entrada>.
// Serve à regra da direção aprovada "teclado não anima": sobreposições abertas ou fechadas pelo teclado
// aparecem e somem na hora, e o item realçado de menus e listas ganha contorno de foco só no teclado.
// Os ouvintes ficam na fase de captura, antes do Radix tratar o evento que abre o componente.

let instalado = false;

function marcar(valor) {
  const raiz = document.documentElement;
  if (raiz.dataset.entrada !== valor) raiz.dataset.entrada = valor;
}

export function instalarModalidade() {
  if (instalado || typeof document === 'undefined') return;
  instalado = true;
  document.addEventListener('keydown', (evento) => {
    // Teclas modificadoras sozinhas (ex.: Shift antes de um clique) não mudam a modalidade.
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(evento.key)) return;
    marcar('teclado');
  }, true);
  document.addEventListener('pointerdown', () => marcar('ponteiro'), true);
  // Passar o ponteiro sobre uma dica depois de usar o teclado volta a animar.
  document.addEventListener('pointermove', () => { if (document.documentElement.dataset.entrada === 'teclado') marcar('ponteiro'); }, { capture: true, passive: true });
}
