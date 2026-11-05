import { useEffect, useId, useRef, useState } from 'react';

// Envolve uma tabela larga: rola na horizontal sem cortar colunas, vira região focável
// (setas do teclado rolam) e mostra uma dica visível só quando há conteúdo além da borda.
export default function TabelaRolavel({ rotulo, children, className = '' }) {
  const regiao = useRef(null);
  const idDica = useId();
  const [transborda, setTransborda] = useState(false);

  useEffect(() => {
    const elemento = regiao.current;
    if (!elemento) return undefined;
    const medir = () => setTransborda(elemento.scrollWidth > elemento.clientWidth + 1);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    if (elemento.firstElementChild) observador.observe(elemento.firstElementChild);
    return () => observador.disconnect();
  }, []);

  return (
    <div className={className}>
      <div
        ref={regiao}
        role="region"
        aria-label={rotulo}
        aria-describedby={transborda ? idDica : undefined}
        tabIndex={transborda ? 0 : undefined}
        className="tabela-rolavel"
      >
        {children}
      </div>
      {transborda && (
        <p id={idDica} className="mt-2 text-xs text-texto-secundario">
          Role a tabela para o lado para ver todas as colunas.
        </p>
      )}
    </div>
  );
}
