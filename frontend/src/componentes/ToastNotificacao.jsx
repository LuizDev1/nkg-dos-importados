import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export default function ToastNotificacao({ aberto, fechar, produto, quantidade = 1 }) {
  useEffect(() => {
    if (!aberto) return;
    const timer = setTimeout(() => {
      fechar();
    }, 4000);
    return () => clearTimeout(timer);
  }, [aberto, fechar]);

  if (!aberto) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-20 z-50 max-w-sm sm:max-w-md w-full anim-toast-in pointer-events-auto"
    >
      <div className="flex items-center gap-3.5 rounded-lg border border-[#d4af45]/50 bg-[#12130f]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4af45]/20 text-[#d4af45]">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af45]">
            Adicionado ao Carrinho!
          </p>
          <p className="truncate text-sm font-medium text-[#f4efe5]">
            {quantidade > 1 ? `${quantidade}x ` : ''}
            {produto?.nome || 'Produto'}
          </p>
          <Link
            to="/carrinho"
            onClick={fechar}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#f0d77e] underline underline-offset-4 hover:text-[#d4af45]"
          >
            <ShoppingBag className="h-3 w-3" />
            Ir para o carrinho &rarr;
          </Link>
        </div>

        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar notificação"
          className="rounded-full p-1 text-[#aaa399] transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
