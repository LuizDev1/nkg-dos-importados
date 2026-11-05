import { forwardRef, useId } from 'react';
import { CAMPO_AJUDA, CAMPO_ERRO, CAMPO_OPCIONAL, CAMPO_ROTULO, classesCampo } from './estilos.mjs';

// Campo com rótulo visível ligado por id, ajuda e erro ligados por aria-describedby.
// `id` pode ser fixado por quem chama (o checkout foca o primeiro inválido pelo id).
const Campo = forwardRef(function Campo({
  rotulo, as: Elemento = 'input', id, ajuda, erro, opcional = false, sufixo = null,
  className = '', classeControle = '', children, 'aria-describedby': descritoPorExterno, ...props
}, ref) {
  const gerado = useId();
  const idCampo = id || `campo-${gerado}`;
  const idAjuda = ajuda ? `${idCampo}-ajuda` : undefined;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  const descritoPor = [descritoPorExterno, idAjuda, idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <label htmlFor={idCampo} className={CAMPO_ROTULO}>
        {rotulo}
        {opcional && <span className={CAMPO_OPCIONAL}> (opcional)</span>}
      </label>
      <div className={sufixo ? 'relative' : 'contents'}>
        <Elemento
          ref={ref}
          id={idCampo}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={descritoPor}
          className={`${classesCampo({ as: Elemento })} ${sufixo ? 'pr-24' : ''} ${classeControle}`.trim()}
          {...props}
        >
          {children}
        </Elemento>
        {/* Controle auxiliar dentro do campo (ex.: "Mostrar" senha); é um botão próprio, com nome próprio. */}
        {sufixo && <div className="absolute inset-y-0 right-2 flex items-center">{sufixo}</div>}
      </div>
      {ajuda && <p id={idAjuda} className={CAMPO_AJUDA}>{ajuda}</p>}
      {erro && <p id={idErro} className={CAMPO_ERRO}>{erro}</p>}
    </div>
  );
});

export default Campo;
