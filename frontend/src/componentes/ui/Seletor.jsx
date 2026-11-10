import { Check, ChevronDown, ChevronUp, CircleAlert } from 'lucide-react';
import { Select } from 'radix-ui';
import { useId } from 'react';
import { CAMPO_AJUDA, CAMPO_ERRO, CAMPO_OPCIONAL, CAMPO_ROTULO, PAINEL_FLUTUANTE, classesItemLista } from './estilos.mjs';
import { instalarModalidade } from './modalidade';

instalarModalidade();

// Seletor com lista própria (Radix Select): rótulo visível, ajuda e erro iguais aos do Campo.
// Teclado: Enter, Espaço ou setas abrem; setas, Home/End e digitação navegam; Enter escolhe; Escape fecha.
// `opcoes`: [{ valor, rotulo, desabilitado }]. Valor vazio não é aceito pelo Radix: use `placeholder`.
// `name` cria um <select> nativo oculto, para o valor seguir no envio de formulários.
export default function Seletor({
  rotulo, opcoes = [], valor, valorPadrao, onValorMudar, placeholder = 'Selecione', ajuda, erro,
  opcional = false, desabilitado = false, obrigatorio = false, name, id, className = '',
}) {
  const gerado = useId();
  const idCampo = id || `seletor-${gerado}`;
  const idAjuda = ajuda ? `${idCampo}-ajuda` : undefined;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  const descritoPor = [idAjuda, idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <label htmlFor={idCampo} className={CAMPO_ROTULO}>
        {rotulo}
        {opcional && <span className={CAMPO_OPCIONAL}> (opcional)</span>}
      </label>
      <Select.Root value={valor} defaultValue={valorPadrao} onValueChange={onValorMudar} disabled={desabilitado} required={obrigatorio} name={name}>
        <Select.Trigger
          id={idCampo}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={descritoPor}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-controle border border-borda-forte bg-campo px-3 py-2.5 text-left text-base text-texto sm:text-sm hover:border-texto aria-invalid:border-erro aria-invalid:hover:border-erro data-placeholder:text-placeholder disabled:cursor-not-allowed disabled:border-borda disabled:bg-superficie-elevada disabled:text-texto-discreto"
        >
          <span className="min-w-0 truncate"><Select.Value placeholder={placeholder} /></span>
          <Select.Icon asChild><ChevronDown aria-hidden="true" size={16} className="shrink-0 text-texto-secundario" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            collisionPadding={16}
            className={`mov-flutuante ${PAINEL_FLUTUANTE} origin-(--radix-select-content-transform-origin) max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) min-w-40 overflow-hidden`}
          >
            <Select.ScrollUpButton className="flex h-7 items-center justify-center text-texto-secundario"><ChevronUp aria-hidden="true" size={16} /></Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {opcoes.map((opcao) => (
                <Select.Item key={opcao.valor} value={opcao.valor} disabled={opcao.desabilitado} className={classesItemLista({ indicador: 'direita' })}>
                  <Select.ItemText>{opcao.rotulo}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2.5 inline-flex text-marca-texto"><Check aria-hidden="true" size={16} /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex h-7 items-center justify-center text-texto-secundario"><ChevronDown aria-hidden="true" size={16} /></Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {ajuda && <p id={idAjuda} className={CAMPO_AJUDA}>{ajuda}</p>}
      {erro && <p id={idErro} className={CAMPO_ERRO}><CircleAlert aria-hidden="true" size={14} className="mt-0.5 shrink-0" />{erro}</p>}
    </div>
  );
}
