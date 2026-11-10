import { useEffect, useState } from 'react';
import BotaoIcone from './ui/BotaoIcone';

export default function AvisoAdmin() {
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    let temporizador;
    function mostrar(evento) {
      window.clearTimeout(temporizador);
      setAviso({ id: Date.now(), mensagem: evento.detail });
      temporizador = window.setTimeout(() => setAviso(null), 4500);
    }
    window.addEventListener('admin:aviso', mostrar);
    return () => {
      window.removeEventListener('admin:aviso', mostrar);
      window.clearTimeout(temporizador);
    };
  }, []);

  if (!aviso) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-(--z-aviso) flex max-w-sm items-center gap-3 rounded-cartao border border-marca-texto bg-superficie-elevada px-4 py-3 text-sm text-texto shadow-nivel-2">
      <span className="text-marca-texto" aria-hidden="true">✓</span>
      <span>{aviso.mensagem}</span>
      <BotaoIcone tamanho="sm" rotulo="Fechar aviso" onClick={() => setAviso(null)}>×</BotaoIcone>
    </div>
  );
}
