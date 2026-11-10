// Define o tema antes da primeira pintura, para não haver clarão. Arquivo próprio (e não script inline)
// para continuar funcionando sob uma Content-Security-Policy sem 'unsafe-inline'.
// Ordem: escolha salva ('claro' ou 'escuro') e, sem ela, a preferência do sistema.
(function () {
  var tema = null;
  try { tema = window.localStorage.getItem('nkg-tema'); } catch (erro) { /* armazenamento indisponível */ }
  if (tema !== 'claro' && tema !== 'escuro') {
    tema = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }
  document.documentElement.setAttribute('data-tema', tema);
})();
