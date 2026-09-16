import { useEffect, useState } from 'react';

export default function CarrosselBanners({ banners }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    setIndice(0);
    if (banners.length < 2) return undefined;
    const intervalo = setInterval(() => {
      setIndice((atual) => (atual + 1) % banners.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [banners]);

  if (!banners.length) return null;
  const banner = banners[indice];
  const imagem = <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6"><div className="overflow-hidden rounded-xl border border-[#343024] bg-[#111210] shadow-[0_18px_45px_rgba(0,0,0,.35)]"><img key={banner.id} src={banner.imagem_url} alt={banner.titulo || 'Banner da loja'} className="block h-auto w-full animate-[page-enter_500ms_ease-out]" /></div></div>;

  return (
    <section className="relative overflow-hidden bg-[#090a09]" aria-label="Destaques da loja">
      {banner.link_url ? <a href={banner.link_url}>{imagem}</a> : imagem}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {banners.map((item, posicao) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndice(posicao)}
              aria-label={`Exibir banner ${posicao + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${posicao === indice ? 'bg-blue-600' : 'bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
