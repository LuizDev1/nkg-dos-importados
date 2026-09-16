import { useEffect, useRef, useState } from 'react';

const TEMPO_BANNER = 15000;
const DURACAO_TRANSICAO = 850;

export function ConteudoBanner({ banner, modoPrevia = '' }) {
  const imagens = [
    { url: banner.imagem_url, x: banner.posicao_x, y: banner.posicao_y },
    { url: banner.imagem_url_2, x: banner.posicao_x_2, y: banner.posicao_y_2 },
  ].filter((imagem) => imagem.url);
  const dupla = imagens.length > 1;
  const colunas = dupla ? (modoPrevia === 'desktop' ? 'grid-cols-2' : modoPrevia === 'celular' ? '' : 'md:grid-cols-2') : '';
  const proporcao = modoPrevia === 'desktop' ? 'aspect-[24/5]' : modoPrevia === 'celular' ? 'aspect-[4/3]' : 'aspect-[4/3] md:aspect-[24/5]';

  return (
    <div className={`grid gap-4 ${colunas} ${proporcao}`}>
      {imagens.map((imagem, indice) => {
        const foto = <img src={imagem.url} alt={`${banner.titulo || 'Banner da loja'}${dupla ? `, imagem ${indice + 1}` : ''}`} className="block h-full w-full object-cover" style={{ objectPosition: `${imagem.x ?? 50}% ${imagem.y ?? 50}%` }} />;
        return (
          <div key={imagem.url} className={`${indice === 1 && modoPrevia !== 'desktop' ? (modoPrevia === 'celular' ? 'hidden' : 'hidden md:block') : ''} min-h-0 overflow-hidden rounded-xl shadow-[0_18px_45px_rgba(0,0,0,.35)]`}>
            {banner.link_url && !modoPrevia ? <a href={banner.link_url} className="block h-full">{foto}</a> : foto}
          </div>
        );
      })}
    </div>
  );
}

export default function CarrosselBanners({ banners }) {
  const [indice, setIndice] = useState(0);
  const [anterior, setAnterior] = useState(null);
  const [direcao, setDirecao] = useState(1);
  const transicao = useRef(null);

  useEffect(() => {
    setIndice(0);
    setAnterior(null);
  }, [banners]);

  useEffect(() => () => clearTimeout(transicao.current), []);

  function mostrar(proximo, sentido = 1) {
    if (banners.length < 2 || anterior !== null || proximo === indice) return;
    setDirecao(sentido);
    setAnterior(indice);
    setIndice(proximo);
    clearTimeout(transicao.current);
    transicao.current = setTimeout(() => setAnterior(null), DURACAO_TRANSICAO);
  }

  useEffect(() => {
    if (banners.length < 2 || anterior !== null) return undefined;
    const temporizador = setTimeout(() => mostrar((indice + 1) % banners.length), TEMPO_BANNER);
    return () => clearTimeout(temporizador);
  }, [banners, indice, anterior]);

  if (!banners.length) return null;

  return (
    <section className="bg-[#090a09]" aria-label="Destaques da loja">
      <div className="mx-auto w-full max-w-[1760px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid min-w-0 overflow-hidden rounded-xl">
            {anterior !== null && <div className={`col-start-1 row-start-1 ${direcao === 1 ? 'banner-slide-out-next' : 'banner-slide-out-prev'}`}><ConteudoBanner banner={banners[anterior]} /></div>}
            <div key={banners[indice].id} className={`col-start-1 row-start-1 ${anterior !== null ? (direcao === 1 ? 'banner-slide-in-next' : 'banner-slide-in-prev') : ''}`}><ConteudoBanner banner={banners[indice]} /></div>
        </div>
        {banners.length > 1 && <div className="mt-4 flex justify-center gap-2">
          {banners.map((banner, posicao) => <button key={banner.id} type="button" onClick={() => mostrar(posicao, posicao > indice ? 1 : -1)} aria-label={`Exibir banner ${posicao + 1}`} aria-current={posicao === indice ? 'true' : undefined} className={`h-2.5 w-2.5 rounded-full ${posicao === indice ? 'bg-[#d4af45]' : 'bg-[#787263]'}`} />)}
        </div>}
      </div>
    </section>
  );
}
