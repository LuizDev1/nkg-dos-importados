import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useRef } from 'react';
import BotaoIcone from './BotaoIcone';
import { instalarModalidade } from './modalidade';

instalarModalidade();

// Diálogo modal e gaveta lateral (Radix Dialog). Ao abrir, o foco vai para o primeiro controle do conteúdo
// (ou para `focoInicial`, um ref); Tab fica preso dentro; Escape e o fundo fecham; ao fechar, o foco volta
// ao gatilho. A página atrás não rola. `titulo` é obrigatório e nomeia a janela.
//   <Dialogo titulo="Remover produto?" gatilho={<Botao>Remover</Botao>}
//     rodape={<><DialogoFechar><Botao variante="discreto">Cancelar</Botao></DialogoFechar><Botao>Remover</Botao></>}>
//     ...
//   </Dialogo>

const LADOS_GAVETA = {
  direita: 'mov-gaveta-direita inset-y-0 right-0 h-dvh w-full max-w-md border-l shadow-nivel-3',
  baixo: 'mov-gaveta-baixo inset-x-0 bottom-0 max-h-[85dvh] rounded-t-painel border-t shadow-nivel-2',
};

function Janela({ tipo, lado, titulo, descricao, gatilho, rodape, aberto, onAbertoMudar, focoInicial, children }) {
  const gaveta = tipo === 'gaveta';
  // Sem `gatilho` (janela controlada por `aberto`), o Radix não sabe para onde devolver o foco:
  // guarda o elemento focado na abertura e volta para ele ao fechar.
  const retorno = useRef(null);
  const aoAbrir = (evento) => {
    if (!gatilho) retorno.current = document.activeElement;
    if (focoInicial) { evento.preventDefault(); focoInicial.current?.focus(); }
  };
  const aoFechar = (evento) => {
    if (gatilho || !retorno.current?.isConnected) return;
    evento.preventDefault();
    retorno.current.focus();
    retorno.current = null;
  };
  const classes = gaveta
    ? `fixed z-(--z-modal) flex flex-col border-borda bg-superficie text-texto outline-none ${LADOS_GAVETA[lado] || LADOS_GAVETA.direita}`
    : 'mov-dialogo fixed inset-0 z-(--z-modal) m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col rounded-painel border border-borda bg-superficie text-texto shadow-nivel-2 outline-none';

  return (
    <Dialog.Root open={aberto} onOpenChange={onAbertoMudar}>
      {gatilho && <Dialog.Trigger asChild>{gatilho}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="mov-veu fixed inset-0 z-(--z-modal) bg-sobreposicao" />
        <Dialog.Content
          className={classes}
          // Sem descrição, aria-describedby explícito evita que o Radix aponte para um id inexistente.
          {...(descricao ? {} : { 'aria-describedby': undefined })}
          onOpenAutoFocus={aoAbrir}
          onCloseAutoFocus={aoFechar}
        >
          <div className="shrink-0 px-5 pb-3 pr-16 pt-5 sm:px-6 sm:pt-6">
            <Dialog.Title className="font-titulo text-titulo-sm text-texto">{titulo}</Dialog.Title>
            {descricao && <Dialog.Description className="mt-1 text-auxiliar text-texto-secundario">{descricao}</Dialog.Description>}
          </div>
          {/* Só esta área rola; overscroll-contain impede que o fim da rolagem passe para a página. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">{children}</div>
          {rodape && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-borda px-5 py-4 sm:px-6">{rodape}</div>}
          {/* O botão de fechar vem por último no DOM: o foco inicial cai no conteúdo, não no X. */}
          <Dialog.Close asChild>
            <BotaoIcone rotulo="Fechar" variante="fantasma" className="absolute right-3 top-3 sm:right-4 sm:top-4"><X size={18} /></BotaoIcone>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Dialogo(props) {
  return <Janela tipo="dialogo" {...props} />;
}

// `lado`: "direita" (painel lateral, padrão) ou "baixo" (folha que sobe do rodapé, para o celular).
export function Gaveta({ lado = 'direita', ...props }) {
  return <Janela tipo="gaveta" lado={lado} {...props} />;
}

// Envolve um botão do rodapé que só fecha a janela (ex.: "Cancelar").
export function DialogoFechar({ children }) {
  return <Dialog.Close asChild>{children}</Dialog.Close>;
}
