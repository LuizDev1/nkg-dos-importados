import { textoNota } from '../servicos/produtoVisual.mjs';

// Ícones do card e do detalhe do produto: SVG com currentColor e traço 1,7 (mesmo padrão dos ícones
// existentes). São sempre decorativos; o significado vem do texto ao lado ou do nome do controle.
function Svg({ tamanho = 18, preenchido = false, className = '', children }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={preenchido ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {children}
    </svg>
  );
}

export const IconeCoracao = ({ cheio = false, ...p }) => <Svg {...p} preenchido={cheio}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></Svg>;
export const IconeEstrela = ({ cheia = true, ...p }) => <Svg {...p} preenchido={cheia}><path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" /></Svg>;
export const IconeCheck = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const IconeAlerta = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5M12 16h.01" /></Svg>;
export const IconeCaixa = (p) => <Svg {...p}><path d="M4 8 12 4l8 4v8l-8 4-8-4Z" /><path d="M4 8l8 4 8-4M12 12v8" /></Svg>;
export const IconeImagem = (p) => <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" /></Svg>;
export const IconeEscudo = (p) => <Svg {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IconeCaminhao = (p) => <Svg {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></Svg>;
export const IconeTroca = (p) => <Svg {...p}><path d="M4 9h13l-3-3M20 15H7l3 3" /></Svg>;
export const IconeUtil = (p) => <Svg {...p}><path d="M7 10v11H3V10h4ZM7 10l4-7a3 3 0 0 1 3 3v4h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7" /></Svg>;
export const IconeCamera = (p) => <Svg {...p}><path d="M14 20H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v5" /><circle cx="12" cy="12" r="4" /><path d="M19 16v6M16 19h6" /></Svg>;

// Estrelas de uma nota: o texto acessível ("Nota 4,7 de 5, 3 avaliações") fica em sr-only e as
// estrelas são decorativas. Estrela vazia usa a cor de borda forte, então a forma (cheia × vazada) também informa.
export function Estrelas({ valor, quantidade, tamanho = 14, className = '' }) {
  const cheias = Math.round(Number(valor) || 0);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`.trim()}>
      <span className="sr-only">{textoNota(valor, quantidade)}</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconeEstrela key={i} tamanho={tamanho} cheia={i <= cheias} className={i <= cheias ? 'text-marca' : 'text-borda-forte'} />
      ))}
    </span>
  );
}

// Fallback de imagem ausente: proporção dada pelo contêiner, ícone e texto (não depende de cor).
export function SemImagem({ nome, className = '' }) {
  return (
    <div role="img" aria-label={`Imagem indisponível de ${nome}`}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-superficie-destaque text-texto-discreto ${className}`.trim()}>
      <IconeImagem tamanho={28} />
      <span className="text-legenda" aria-hidden="true">Sem imagem</span>
    </div>
  );
}
