import { Tabs } from 'radix-ui';

// Abas (Radix Tabs, padrão WAI-ARIA "tabs" com ativação automática): Tab entra na aba ativa,
// setas trocam de aba, Home/End vão para a primeira e a última, Tab seguinte vai para o painel.
// A aba ativa se distingue por cor, peso e um traço de 2 px: legível sem animação.
// `abas`: [{ valor, rotulo, conteudo, desabilitada }].
//   <Abas rotulo="Informações do produto" abas={[{ valor: 'descricao', rotulo: 'Descrição', conteudo: ... }]} />
export default function Abas({ rotulo, abas = [], valor, valorPadrao, onValorMudar, className = '' }) {
  return (
    <Tabs.Root value={valor} defaultValue={valorPadrao ?? abas[0]?.valor} onValueChange={onValorMudar} className={`min-w-0 ${className}`.trim()}>
      {/* A linha de base é uma sombra interna: o traço da aba ativa pinta por cima sem transbordar a lista,
          que só rola na horizontal quando as abas não cabem (320 px). */}
      <Tabs.List aria-label={rotulo} className="flex max-w-full gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain shadow-[inset_0_-1px_0_var(--color-borda)] [scrollbar-width:thin]">
        {abas.map((aba) => (
          <Tabs.Trigger
            key={aba.valor}
            value={aba.valor}
            disabled={aba.desabilitada}
            className="aba relative min-h-11 shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 text-auxiliar font-medium text-texto-secundario hover:text-texto data-[state=active]:border-marca-texto data-[state=active]:font-semibold data-[state=active]:text-texto disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aba.rotulo}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {abas.map((aba) => (
        <Tabs.Content key={aba.valor} value={aba.valor} className="pt-4 text-corpo text-texto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco">
          {aba.conteudo}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
