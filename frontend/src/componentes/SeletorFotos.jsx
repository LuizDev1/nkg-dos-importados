import { useEffect, useRef, useState, useId } from 'react';
const API_URL = import.meta.env.VITE_API_URL || '/api';
export default function SeletorFotos({ fotos, onChange, maximo = 5, rotulo = 'Fotos', disabled = false, onCarregando }) {
  const id = useId();
  const ativo = useRef(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  async function selecionar(evento) {
    const arquivos = [...(evento.target.files || [])];
    evento.target.value = '';
    if (!arquivos.length || carregando || disabled) return;
    if (fotos.length + arquivos.length > maximo) { setErro('Limite de ' + maximo + ' fotos.'); return; }
    if (arquivos.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 1024 * 1024)) { setErro('Use JPG, PNG ou WebP de até 1 MB cada.'); return; }
    setCarregando(true); onCarregando?.(true); setErro('');
    try {
      const novas = [];
      for (const arquivo of arquivos) {
        const resposta = await fetch(API_URL + '/imagens', { method: 'POST', headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || ''), 'Content-Type': arquivo.type }, body: arquivo });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao enviar foto');
        const origem = new URL(API_URL, window.location.origin).origin;
        novas.push(new URL(dados.imagem_url, origem).href);
      }
      if (ativo.current) onChange([...fotos, ...novas]);
    } catch (e) { if (ativo.current) setErro(e.message); }
    finally { if (ativo.current) { setCarregando(false); onCarregando?.(false); } }
  }
  return <div className="col-span-2 sm:col-span-3">
    <label htmlFor={id} className="block text-sm font-semibold">{rotulo}</label>
    <label htmlFor={id} className="mt-2 flex h-20 cursor-pointer items-center justify-center rounded border border-dashed border-[#45402f] bg-[#181915] text-[#d4af45] hover:border-[#d4af45]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 20H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v5" /><circle cx="12" cy="12" r="4" /><path d="M19 16v6M16 19h6" /></svg>
      <span className="sr-only">Selecionar fotos</span>
    </label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple={maximo > 1} disabled={disabled || carregando || fotos.length >= maximo} onChange={selecionar} className="sr-only" />
    <p className="mt-2 text-xs text-[#aaa396]">{fotos.length}/{maximo} - JPG, PNG ou WebP</p>
    {carregando && <p role="status" className="mt-2 text-sm">Enviando fotos...</p>}
    {erro && <p role="alert" className="mt-2 text-sm text-red-600">{erro}</p>}
    <div className="mt-3 flex flex-wrap gap-3">{fotos.map((foto, i) => <div key={foto + i} className="relative">
      <img src={foto} alt={'Foto ' + (i + 1)} className="h-20 w-20 rounded object-cover" />
      <button type="button" disabled={disabled || carregando} onClick={() => onChange(fotos.filter((_, indice) => indice !== i))} aria-label={'Remover foto ' + (i + 1)} className="absolute -right-2 -top-2 rounded-full bg-[#11120f] px-2 text-[#d4af45]">×</button>
      {maximo > 1 && i === 0 && <p className="text-xs text-[#aaa396]">Principal</p>}
    </div>)}</div>
  </div>;
}
