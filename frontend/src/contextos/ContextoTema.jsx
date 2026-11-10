import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Tema claro ou escuro. Segue o sistema até o usuário escolher; a escolha fica salva em 'nkg-tema'.
// O valor inicial já foi aplicado em <html data-tema> por public/tema-inicial.js, antes da pintura.
const CHAVE = 'nkg-tema';
const ContextoTema = createContext(null);

const lerSalvo = () => {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor === 'claro' || valor === 'escuro' ? valor : null;
  } catch {
    return null;
  }
};
const temaDoSistema = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
const reduzirMovimento = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Aplica sem disparar as transições de cor de cada elemento (better-ui). Com movimento permitido e
// suporte do navegador, a troca vira um crossfade de 200 ms (view transition); senão, é instantânea.
function aplicarNoDocumento(tema) {
  const raiz = document.documentElement;
  const trocar = () => {
    raiz.classList.add('trocando-tema');
    raiz.setAttribute('data-tema', tema);
    void raiz.offsetHeight; // força o recálculo antes de devolver as transições
    requestAnimationFrame(() => raiz.classList.remove('trocando-tema'));
  };
  if (typeof document.startViewTransition === 'function' && !reduzirMovimento()) document.startViewTransition(trocar);
  else trocar();
}

export function ProvedorTema({ children }) {
  const [tema, setTema] = useState(() => document.documentElement.getAttribute('data-tema') || lerSalvo() || temaDoSistema());
  const manual = useRef(lerSalvo() !== null);

  const aplicar = useCallback((novo) => {
    aplicarNoDocumento(novo);
    setTema(novo);
  }, []);

  // Sem escolha manual, acompanha a mudança do sistema (ex.: modo escuro automático à noite).
  useEffect(() => {
    const consulta = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!consulta) return undefined;
    const seguir = () => { if (!manual.current) aplicar(consulta.matches ? 'escuro' : 'claro'); };
    consulta.addEventListener('change', seguir);
    return () => consulta.removeEventListener('change', seguir);
  }, [aplicar]);

  // Outra aba mudou a escolha: acompanha.
  useEffect(() => {
    const aoArmazenar = (evento) => {
      if (evento.key !== CHAVE) return;
      const salvo = lerSalvo();
      manual.current = salvo !== null;
      aplicar(salvo || temaDoSistema());
    };
    window.addEventListener('storage', aoArmazenar);
    return () => window.removeEventListener('storage', aoArmazenar);
  }, [aplicar]);

  const alternar = useCallback(() => {
    const novo = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    try { window.localStorage.setItem(CHAVE, novo); } catch { /* sem armazenamento: vale só nesta visita */ }
    manual.current = true;
    aplicar(novo);
  }, [aplicar]);

  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar]);
  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>;
}

export function useTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) throw new Error('useTema precisa estar dentro de ProvedorTema');
  return contexto;
}
