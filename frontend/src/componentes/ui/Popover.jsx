import { X } from 'lucide-react';
import { Popover as PopoverRadix } from 'radix-ui';
import BotaoIcone from './BotaoIcone';
import { PAINEL_FLUTUANTE } from './estilos.mjs';
import { instalarModalidade } from './modalidade';

instalarModalidade();

// Painel não modal ancorado no gatilho (Radix Popover): para conteúdo curto e interativo
// (ex.: filtro de preço). Ao abrir, o foco vai para o primeiro controle do painel; Escape ou clique fora fecha
// e o foco volta ao gatilho. Tab continua livre pela página (não é modal).
//   <Popover gatilho={<Botao variante="secundario">Preço</Botao>} titulo="Faixa de preço">...</Popover>
export default function Popover({ gatilho, titulo, lado = 'bottom', alinhamento = 'start', aberto, onAbertoMudar, comFechar = true, children }) {
  return (
    <PopoverRadix.Root open={aberto} onOpenChange={onAbertoMudar}>
      <PopoverRadix.Trigger asChild>{gatilho}</PopoverRadix.Trigger>
      <PopoverRadix.Portal>
        <PopoverRadix.Content
          side={lado}
          align={alinhamento}
          sideOffset={8}
          collisionPadding={16}
          aria-label={titulo}
          className={`mov-flutuante ${PAINEL_FLUTUANTE} origin-(--radix-popover-content-transform-origin) w-[min(20rem,calc(100vw-2rem))] p-4`}
        >
          {titulo && <p className={`text-rotulo text-texto ${comFechar ? 'pr-9' : ''}`}>{titulo}</p>}
          <div className={titulo ? 'mt-3' : ''}>{children}</div>
          {comFechar && (
            <PopoverRadix.Close asChild>
              <BotaoIcone rotulo="Fechar" variante="fantasma" tamanho="sm" className="absolute right-2 top-2"><X size={16} /></BotaoIcone>
            </PopoverRadix.Close>
          )}
        </PopoverRadix.Content>
      </PopoverRadix.Portal>
    </PopoverRadix.Root>
  );
}
