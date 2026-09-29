import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
let carregamentoScript;

function carregarScript() {
  if (window.turnstile) return Promise.resolve();
  if (carregamentoScript) return carregamentoScript;
  carregamentoScript = new Promise((resolve, reject) => {
    const existente = document.querySelector('script[data-nkg-turnstile]');
    if (existente) {
      existente.addEventListener('load', resolve, { once: true });
      existente.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.nkgTurnstile = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return carregamentoScript;
}

export function turnstileAtivo() {
  return Boolean(SITE_KEY);
}

export default function Turnstile({ acao, aoValidar }) {
  const elemento = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let ativo = true;
    let widgetId;
    carregarScript().then(() => {
      if (!ativo || !elemento.current) return;
      widgetId = window.turnstile.render(elemento.current, {
        sitekey: SITE_KEY,
        action: acao,
        theme: 'dark',
        callback: (token) => aoValidar(token),
        'expired-callback': () => aoValidar(''),
        'error-callback': () => aoValidar(''),
      });
    }).catch(() => aoValidar(''));
    return () => {
      ativo = false;
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [acao, aoValidar]);

  if (!SITE_KEY) return null;
  return <div ref={elemento} className="mb-5 flex min-h-[65px] justify-center" />;
}
