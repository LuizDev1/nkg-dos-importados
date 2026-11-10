import { Tooltip } from 'radix-ui';
import { createContext, useContext } from 'react';
import { instalarModalidade } from './modalidade';

instalarModalidade();

// Dica curta (Radix Tooltip): aparece no hover depois de 500 ms ou no foco do teclado; Escape fecha.
// Só complementa: o gatilho precisa ter nome próprio (BotaoIcone já tem `rotulo`), porque a dica não
// existe no toque. Com o ProvedorDicas por perto, dicas vizinhas abrem sem atraso e sem animação.
//   <Dica texto="Adicionar aos favoritos"><BotaoIcone rotulo="Adicionar aos favoritos">...</BotaoIcone></Dica>

const ComProvedor = createContext(false);
const ATRASO = 500;
const PULO = 300;

export function ProvedorDicas({ children }) {
  return (
    <Tooltip.Provider delayDuration={ATRASO} skipDelayDuration={PULO}>
      <ComProvedor.Provider value>{children}</ComProvedor.Provider>
    </Tooltip.Provider>
  );
}

export default function Dica({ texto, lado = 'top', children }) {
  const temProvedor = useContext(ComProvedor);
  const dica = (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={lado}
          sideOffset={6}
          collisionPadding={12}
          className="mov-dica z-(--z-flutuante) max-w-64 origin-(--radix-tooltip-content-transform-origin) rounded-pequeno bg-texto px-2.5 py-1.5 text-legenda font-medium text-fundo shadow-nivel-1"
        >
          {texto}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
  // Fora de um ProvedorDicas, cada dica traz o seu, para nunca quebrar quem a usar isolada.
  return temProvedor ? dica : <Tooltip.Provider delayDuration={ATRASO} skipDelayDuration={PULO}>{dica}</Tooltip.Provider>;
}
