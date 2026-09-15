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
  const imagem = (
    <img src={banner.imagem_url} alt={banner.titulo || 'Banner da loja'} className="h-48 w-full object-cover sm:h-72 lg:h-96" />
  );

  return (
    <section className="relative overflow-hidden bg-gray-100" aria-label="Destaques da loja">
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
