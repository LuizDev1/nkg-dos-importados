import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Toast } from 'radix-ui';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Avisos temporários (Radix Toast). Não bloqueiam a página nem tiram o foco de onde está; F8 leva o foco
// à região de avisos. Pausam com o ponteiro ou o foco em cima e com a janela em segundo plano; no toque,
// arrastar para a direita dispensa. Erros são anunciados na hora (assertivo); o resto, com educação.
// Erro e aviso com ação só saem quando dispensados. Até três na tela; os seguintes esperam na fila.
// Condição de integração: o Radix Dialog torna o resto da página inerte. Feche o diálogo/gaveta antes de
// avisar; se ele precisar continuar aberto, configure o anúncio e o posicionamento acessíveis antes de usar.
//   const { avisar } = useAvisos();
//   avisar({ titulo: 'Produto adicionado ao carrinho', tom: 'sucesso', acao: { rotulo: 'Desfazer', aoClicar: desfazer } });
// O ProvedorAvisos ainda não envolve o App: entra junto da tela que adotar os avisos (fases 2 a 7).

const Contexto = createContext(null);
const MAXIMO_VISIVEIS = 3;

const TONS = {
  sucesso: { Icone: CircleCheck, cor: 'text-sucesso' },
  erro: { Icone: CircleAlert, cor: 'text-erro' },
  aviso: { Icone: TriangleAlert, cor: 'text-aviso' },
  info: { Icone: Info, cor: 'text-info' },
};

// Receita Animate para toasts: 400 ms com a curva `ease` do CSS, entrando e saindo pelo mesmo caminho.
// motion (e não keyframes) para a saída e o reflow da pilha serem interrompíveis.
const TRANSICAO = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] };

export function ProvedorAvisos({ children }) {
  const [avisos, setAvisos] = useState([]);
  const proximoId = useRef(0);
  const reduzir = useReducedMotion();

  const dispensar = useCallback((id) => setAvisos((lista) => lista.filter((aviso) => aviso.id !== id)), []);
  const avisar = useCallback(({ titulo, descricao, tom = 'info', acao, duracao } = {}) => {
    proximoId.current += 1;
    const id = proximoId.current;
    // Erro e aviso com ação ficam até serem dispensados: dá para ler e decidir sem prazo (WCAG 2.2.1).
    // Os demais somem sozinhos (5 s por padrão).
    const tempo = tom === 'erro' || acao ? Infinity : (duracao ?? 5000);
    // Fila: nenhum aviso é descartado; os que passam de três esperam a vez (ver `visiveis`).
    setAvisos((lista) => [...lista, { id, titulo, descricao, tom, acao, duracao: tempo }]);
    return id;
  }, []);
  const valor = useMemo(() => ({ avisar, dispensar }), [avisar, dispensar]);

  // Só os três mais antigos aparecem; o cronômetro de cada um começa quando entra na tela.
  const visiveis = avisos.slice(0, MAXIMO_VISIVEIS);
  const entrada = reduzir ? { opacity: 0 } : { opacity: 0, y: '100%' };
  const repouso = reduzir ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <Contexto.Provider value={valor}>
      <Toast.Provider swipeDirection="right" label="Aviso">
        {children}
        <AnimatePresence initial={false}>
          {visiveis.map((aviso) => {
            const { Icone, cor } = TONS[aviso.tom] || TONS.info;
            return (
              <Toast.Root
                key={aviso.id}
                asChild
                forceMount
                type={aviso.tom === 'erro' ? 'foreground' : 'background'}
                duration={aviso.duracao}
                onOpenChange={(aberto) => { if (!aberto) dispensar(aviso.id); }}
              >
                <motion.li
                  layout={!reduzir}
                  initial={entrada}
                  animate={repouso}
                  exit={entrada}
                  transition={TRANSICAO}
                  className="aviso pointer-events-auto list-none"
                >
                  <div className="aviso-corpo relative flex items-start gap-3 rounded-cartao border border-borda bg-superficie py-3 pl-4 pr-12 text-texto shadow-nivel-2">
                    <Icone aria-hidden="true" size={18} className={`mt-0.5 shrink-0 ${cor}`} />
                    <div className="min-w-0 flex-1">
                      <Toast.Title className="text-auxiliar font-semibold text-texto">{aviso.titulo}</Toast.Title>
                      {aviso.descricao && <Toast.Description className="mt-0.5 text-auxiliar text-texto-secundario">{aviso.descricao}</Toast.Description>}
                      {aviso.acao && (
                        <Toast.Action
                          altText={aviso.acao.textoAlternativo || aviso.acao.rotulo}
                          onClick={aviso.acao.aoClicar}
                          className="mt-2 inline-flex min-h-9 items-center rounded-controle border border-borda-destaque px-3 text-auxiliar font-semibold text-texto hover:bg-superficie-elevada"
                        >
                          {aviso.acao.rotulo}
                        </Toast.Action>
                      )}
                    </div>
                    <Toast.Close aria-label="Fechar aviso" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-controle text-texto-secundario hover:bg-superficie-elevada hover:text-texto">
                      <X aria-hidden="true" size={16} />
                    </Toast.Close>
                  </div>
                </motion.li>
              </Toast.Root>
            );
          })}
        </AnimatePresence>
        {/* A região não captura cliques: só os avisos em si recebem o ponteiro. */}
        <Toast.Viewport
          label="Avisos ({hotkey})"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-(--z-aviso) m-0 flex max-h-dvh flex-col gap-2 p-4 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foco sm:left-auto sm:w-[24rem]"
        />
      </Toast.Provider>
    </Contexto.Provider>
  );
}

export function useAvisos() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAvisos precisa estar dentro de <ProvedorAvisos>.');
  return contexto;
}
