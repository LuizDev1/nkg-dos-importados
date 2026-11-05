import { useEffect, useRef } from 'react';
import Cabecalho from './componentes/Cabecalho';
import Rodape from './componentes/Rodape';
import AvisoAdmin from './componentes/AvisoAdmin';
import RotasApp from './rotas/RotasApp';
import { useLocation } from 'react-router-dom';
import { tituloDaRota } from './rotas/titulos';

function App() {
  const location = useLocation();
  const areaAdmin = location.pathname.startsWith('/admin');
  const conteudo = useRef(null);
  const rotaAnterior = useRef(null);

  // Troca de rota no cliente: atualiza o título e leva o foco ao conteúdo novo (WCAG 2.4.2 e 2.4.3).
  // Compara com a rota anterior (e não com um indicador de "primeira vez") para o carregamento inicial
  // não roubar o foco, inclusive quando o StrictMode executa o efeito duas vezes.
  useEffect(() => {
    document.title = `${tituloDaRota(location.pathname)} · NKG dos Importados`;
    const anterior = rotaAnterior.current;
    rotaAnterior.current = location.pathname;
    if (anterior === null || anterior === location.pathname || location.hash) return;
    window.scrollTo(0, 0);
    conteudo.current?.focus({ preventScroll: true });
  }, [location.pathname, location.hash]);

  // O cabeçalho é fixo e muda de altura com a largura (76 px no desktop, 167 px no celular). A altura real
  // vira --altura-cabecalho, usada no scroll-padding, para o foco nunca ficar escondido atrás dele (WCAG 2.4.11).
  useEffect(() => {
    const cabecalho = document.querySelector('header');
    if (!cabecalho || typeof ResizeObserver === 'undefined') return undefined;
    const raiz = document.documentElement;
    const observador = new ResizeObserver(() => {
      raiz.style.setProperty('--altura-cabecalho', `${Math.ceil(cabecalho.getBoundingClientRect().height)}px`);
    });
    observador.observe(cabecalho);
    return () => { observador.disconnect(); raiz.style.removeProperty('--altura-cabecalho'); };
  }, []);

  return (
    <div className={`site-shell min-h-screen flex flex-col text-[#f4efe5] ${areaAdmin ? 'admin-area' : ''}`}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-acao focus:px-4 focus:py-2 focus:font-semibold focus:text-acao-texto">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" ref={conteudo} tabIndex={-1} data-foco-rota className="flex-1">
        <RotasApp />
      </main>
      <Rodape />
      {areaAdmin && <AvisoAdmin />}
    </div>
  );
}

export default App;
