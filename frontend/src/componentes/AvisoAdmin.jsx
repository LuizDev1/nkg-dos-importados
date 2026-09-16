import { useEffect, useState } from 'react';

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
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-4 rounded-lg border border-[#d4af45] bg-[#171813] px-4 py-3 text-sm text-[#f4efe5] shadow-xl">
      <span className="text-[#d4af45]" aria-hidden="true">✓</span>
      <span>{aviso.mensagem}</span>
      <button type="button" onClick={() => setAviso(null)} aria-label="Fechar aviso" className="text-[#d4af45] hover:text-white">×</button>
    </div>
  );
}
