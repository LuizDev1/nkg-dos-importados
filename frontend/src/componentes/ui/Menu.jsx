import { Check } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { PAINEL_FLUTUANTE, ROTULO_LISTA, SEPARADOR_LISTA, classesItemLista } from './estilos.mjs';
import { instalarModalidade } from './modalidade';

instalarModalidade();

// Menu de ações (Radix DropdownMenu, padrão WAI-ARIA "menu button").
// Teclado: Enter, Espaço ou seta para baixo abrem; setas, Home/End e digitação navegam; Escape fecha
// e devolve o foco ao gatilho. O gatilho é o próprio filho (ex.: <Botao> ou <BotaoIcone>).
//   <Menu gatilho={<Botao>Ações</Botao>}>
//     <MenuItem icone={<Pencil />} onSelecionar={editar}>Editar</MenuItem>
//     <MenuSeparador />
//     <MenuItem destrutivo onSelecionar={remover}>Remover</MenuItem>
//   </Menu>
export default function Menu({ gatilho, rotulo, alinhamento = 'start', lado = 'bottom', aberto, onAbertoMudar, children }) {
  return (
    <DropdownMenu.Root open={aberto} onOpenChange={onAbertoMudar}>
      <DropdownMenu.Trigger asChild>{gatilho}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          aria-label={rotulo}
          align={alinhamento}
          side={lado}
          sideOffset={6}
          collisionPadding={16}
          className={`mov-flutuante ${PAINEL_FLUTUANTE} origin-(--radix-dropdown-menu-content-transform-origin) max-h-(--radix-dropdown-menu-content-available-height) min-w-48 max-w-[calc(100vw-2rem)] overflow-y-auto p-1`}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MenuItem({ icone = null, destrutivo = false, desabilitado = false, onSelecionar, children }) {
  return (
    <DropdownMenu.Item disabled={desabilitado} onSelect={onSelecionar} className={classesItemLista({ destrutivo })}>
      {icone && <span aria-hidden="true" className="inline-flex shrink-0 [&>svg]:size-4">{icone}</span>}
      {children}
    </DropdownMenu.Item>
  );
}

// Opção liga/desliga dentro do menu (role="menuitemcheckbox"). O menu fica aberto para marcar várias.
export function MenuOpcao({ marcado, onMarcadoMudar, desabilitado = false, children }) {
  return (
    <DropdownMenu.CheckboxItem
      checked={marcado}
      onCheckedChange={onMarcadoMudar}
      disabled={desabilitado}
      onSelect={(evento) => evento.preventDefault()}
      className={classesItemLista({ indicador: 'esquerda' })}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2.5 inline-flex text-marca-texto"><Check aria-hidden="true" size={16} /></DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  );
}

export function MenuRotulo({ children }) {
  return <DropdownMenu.Label className={ROTULO_LISTA}>{children}</DropdownMenu.Label>;
}

export function MenuSeparador() {
  return <DropdownMenu.Separator className={SEPARADOR_LISTA} />;
}
