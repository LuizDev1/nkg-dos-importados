import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        const foto = (
          <img
            src={imagem.url}
            alt={`${banner.titulo || 'Banner da loja'}${dupla ? `, imagem ${indice + 1}` : ''}`}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-102"
            style={{ objectPosition: `${imagem.x ?? 50}% ${imagem.y ?? 50}%` }}
          />
        );
        return (
          <div
            key={imagem.url}
            className={`${indice === 1 && modoPrevia !== 'desktop' ? (modoPrevia === 'celular' ? 'hidden' : 'hidden md:block') : ''} min-h-0 overflow-hidden rounded-xl shadow-[0_18px_45px_rgba(0,0,0,.35)]`}
          >
            {banner.link_url && !modoPrevia ? (
              <a href={banner.link_url} className="block h-full">{foto}</a>
            ) : (
              foto
            )}
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
  const [pausado, setPausado] = useState(false);
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
    if (banners.length < 2 || anterior !== null || pausado) return undefined;
    const temporizador = setTimeout(() => {
      setDirecao(1);
      setAnterior(indice);
      setIndice((indice + 1) % banners.length);
      clearTimeout(transicao.current);
      transicao.current = setTimeout(() => setAnterior(null), DURACAO_TRANSICAO);
    }, TEMPO_BANNER);
    return () => clearTimeout(temporizador);
  }, [banners, indice, anterior, pausado]);

  if (!banners.length) return null;

  return (
    <section className="bg-[#090a09]" aria-label="Destaques da loja">
      <div className="mx-auto w-full max-w-[1760px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div
          className="group relative min-w-0"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <div className="grid min-w-0 overflow-hidden rounded-xl">
            {anterior !== null && (
              <div className={`col-start-1 row-start-1 ${direcao === 1 ? 'banner-slide-out-next' : 'banner-slide-out-prev'}`}>
                <ConteudoBanner banner={banners[anterior]} />
              </div>
            )}
            <div
              key={banners[indice].id}
              className={`col-start-1 row-start-1 ${anterior !== null ? (direcao === 1 ? 'banner-slide-in-next' : 'banner-slide-in-prev') : ''}`}
            >
              <ConteudoBanner banner={banners[indice]} />
            </div>
          </div>

          {/* Botões de navegação lateral com fade no hover */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => mostrar((indice - 1 + banners.length) % banners.length, -1)}
                aria-label="Banner anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#d4af45] hover:text-[#d4af45] group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => mostrar((indice + 1) % banners.length, 1)}
                aria-label="Próximo banner"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#d4af45] hover:text-[#d4af45] group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores e barra de progresso */}
        {banners.length > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
              {banners.map((banner, posicao) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => mostrar(posicao, posicao > indice ? 1 : -1)}
                  aria-label={`Exibir banner ${posicao + 1}`}
                  aria-current={posicao === indice ? 'true' : undefined}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    posicao === indice
                      ? 'w-6 bg-[#d4af45]'
                      : 'w-2 bg-[#787263]/60 hover:bg-[#aaa399]'
                  }`}
                />
              ))}
            </div>

            {/* Barra de progresso linear fina */}
            <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
              <div
                key={`${indice}-${pausado}`}
                className="h-full bg-gradient-to-r from-[#d4af45] to-[#f0d77e] anim-progresso-banner"
                style={{
                  animationPlayState: pausado ? 'paused' : 'running',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
