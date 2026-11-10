// Quatro ícones da Lucide Animated (sol, lua, coração, carrinho), adaptados para JSX.
// Origem e licença (MIT) em LICENCA.md, nesta pasta. Adaptações:
// - sem animação ao passar o ponteiro (ação frequente demais): o pulso é disparado pelo componente pai,
//   pelo ref (`pulsar()`), só depois de uma ação do usuário com o ponteiro;
// - coração e carrinho com um único pulso de 300 ms (o original repetia por até 1,35 s);
// - com prefers-reduced-motion, `pulsar()` não faz nada e o ícone fica estático.
import { motion, useAnimation } from 'motion/react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

// Consultado no momento do clique: acompanha a preferência mesmo se ela mudar com a página aberta.
const movimentoReduzido = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const SVG_BASE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 2,
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: false,
};

// Controle comum: `pulsar()` anima uma vez e volta ao estado normal depois de `duracaoMs`.
function useControlePulso(ref, duracaoMs) {
  const controles = useAnimation();
  const temporizador = useRef(null);
  useImperativeHandle(ref, () => ({
    pulsar() {
      if (movimentoReduzido()) return;
      clearTimeout(temporizador.current);
      controles.start('animar');
      temporizador.current = setTimeout(() => controles.start('normal'), duracaoMs);
    },
  }), [controles, duracaoMs]);
  return controles;
}

const RAIOS_SOL = [
  'M12 2v2', 'm19.07 4.93-1.41 1.41', 'M20 12h2', 'm17.66 17.66 1.41 1.41',
  'M12 20v2', 'm6.34 17.66-1.41 1.41', 'M2 12h2', 'm4.93 4.93 1.41 1.41',
];
const VARIANTES_RAIO = {
  normal: { opacity: 1 },
  animar: (i) => ({ opacity: [0, 1], transition: { delay: i * 0.05, duration: 0.2 } }),
};

export const IconeSol = forwardRef(function IconeSol({ tamanho = 20, className, ...resto }, ref) {
  const controles = useControlePulso(ref, 650);
  return (
    <span className={className} {...resto}>
      <svg {...SVG_BASE} width={tamanho} height={tamanho}>
        <circle cx="12" cy="12" r="4" />
        {RAIOS_SOL.map((d, i) => (
          <motion.path key={d} d={d} custom={i + 1} variants={VARIANTES_RAIO} animate={controles} />
        ))}
      </svg>
    </span>
  );
});

export const IconeLua = forwardRef(function IconeLua({ tamanho = 20, className, ...resto }, ref) {
  const controles = useControlePulso(ref, 650);
  return (
    <span className={className} {...resto}>
      <motion.svg
        {...SVG_BASE}
        width={tamanho}
        height={tamanho}
        animate={controles}
        variants={{ normal: { rotate: 0 }, animar: { rotate: [0, -10, 10, -5, 0] } }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </motion.svg>
    </span>
  );
});

export const IconeCoracao = forwardRef(function IconeCoracao({ tamanho = 20, preenchido = false, className, ...resto }, ref) {
  const controles = useControlePulso(ref, 300);
  return (
    <span className={className} {...resto}>
      <motion.svg
        {...SVG_BASE}
        fill={preenchido ? 'currentColor' : 'none'}
        width={tamanho}
        height={tamanho}
        animate={controles}
        variants={{ normal: { scale: 1 }, animar: { scale: [1, 1.08, 1] } }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </motion.svg>
    </span>
  );
});

export const IconeCarrinho = forwardRef(function IconeCarrinho({ tamanho = 20, className, ...resto }, ref) {
  const controles = useControlePulso(ref, 300);
  return (
    <span className={className} {...resto}>
      <motion.svg
        {...SVG_BASE}
        width={tamanho}
        height={tamanho}
        animate={controles}
        variants={{ normal: { y: 0 }, animar: { y: [0, -4, 0] } }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" />
      </motion.svg>
    </span>
  );
});

// Ponteiro ou teclado: o clique de teclado (Enter/Espaço) chega com detail === 0 e não anima.
export const veioDoPonteiro = (evento) => Boolean(evento && evento.detail > 0);
