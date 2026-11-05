import { classesSelo, tomDoStatus } from './estilos.mjs';

// Ícones por tom (stroke = currentColor). O texto do selo carrega o significado; ícone e cor são reforço.
const ICONES = {
  sucesso: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  aviso: <><path d="M12 7v6" /><path d="M12 17h.01" /></>,
  erro: <><path d="M7 7l10 10" /><path d="M17 7L7 17" /></>,
  info: <><path d="M12 11v6" /><path d="M12 7h.01" /></>,
  neutro: <circle cx="12" cy="12" r="3" />,
};

export default function SeloStatus({ tom, status, className = '', children }) {
  const tomFinal = tom || tomDoStatus(status);
  return (
    <span className={`${classesSelo(tomFinal)} ${className}`.trim()}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {ICONES[tomFinal] || ICONES.neutro}
      </svg>
      {children}
    </span>
  );
}
