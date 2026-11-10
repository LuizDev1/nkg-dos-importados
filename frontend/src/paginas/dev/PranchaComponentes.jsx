import { Copy, Ellipsis, Eye, Heart, Minus, Plus, Search, ShoppingCart, SlidersHorizontal, Trash2, Truck, User, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import Abas from '../../componentes/ui/Abas';
import { ProvedorAvisos, useAvisos } from '../../componentes/ui/Avisos';
import Botao from '../../componentes/ui/Botao';
import Dica, { ProvedorDicas } from '../../componentes/ui/Dica';
import Dialogo, { DialogoFechar, Gaveta } from '../../componentes/ui/Dialogo';
import Menu, { MenuItem, MenuOpcao, MenuRotulo, MenuSeparador } from '../../componentes/ui/Menu';
import Popover from '../../componentes/ui/Popover';
import Seletor from '../../componentes/ui/Seletor';
import BotaoIcone from '../../componentes/ui/BotaoIcone';
import BotaoTema from '../../componentes/ui/BotaoTema';
import Campo from '../../componentes/ui/Campo';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import Superficie from '../../componentes/ui/Superficie';
import { IconeCarrinho, IconeCoracao, veioDoPonteiro } from '../../componentes/icones/animados/IconesAnimados';
import { useTema } from '../../contextos/ContextoTema';

// Prancha das fases 1A e 1B: tokens, tipografia, ícones, primitivas e componentes interativos nos dois temas.
// Existe só em desenvolvimento (RotasApp carrega esta página apenas com import.meta.env.DEV).
// Textos e valores vêm da própria loja (rótulos das telas e preços do catálogo real).

const CORES = [
  ['fundo', 'Fundo'], ['superficie', 'Cartão'], ['superficie-elevada', 'Auxiliar'], ['superficie-destaque', 'Interativa'],
  ['texto', 'Texto'], ['texto-secundario', 'Texto de apoio'], ['texto-discreto', 'Texto discreto'],
  ['borda', 'Borda'], ['borda-destaque', 'Borda forte'], ['borda-forte', 'Borda de controle'],
  ['marca', 'Ação principal'], ['marca-texto', 'Marca e foco'], ['marca-suave', 'Realce'],
  ['erro', 'Erro'], ['aviso', 'Aviso'], ['sucesso', 'Sucesso'], ['info', 'Informação'], ['banner-preenchimento', 'Preenchimento do banner'],
];

const AMOSTRA = {
  'fundo': 'bg-fundo',
  'superficie': 'bg-superficie',
  'superficie-elevada': 'bg-superficie-elevada',
  'superficie-destaque': 'bg-superficie-destaque',
  'texto': 'bg-texto',
  'texto-secundario': 'bg-texto-secundario',
  'texto-discreto': 'bg-texto-discreto',
  'borda': 'bg-borda',
  'borda-destaque': 'bg-borda-destaque',
  'borda-forte': 'bg-borda-forte',
  'marca': 'bg-marca',
  'marca-texto': 'bg-marca-texto',
  'marca-suave': 'bg-marca-suave',
  'erro': 'bg-erro',
  'aviso': 'bg-aviso',
  'sucesso': 'bg-sucesso',
  'info': 'bg-info',
  'banner-preenchimento': 'bg-banner-preenchimento',
};

function Linha({ titulo, children }) {
  return (
    <section className="grid gap-3 border-t border-borda py-6 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-6">
      <h2 className="text-rotulo text-texto">{titulo}</h2>
      <div className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-5">{children}</div>
    </section>
  );
}

function Estado({ nome, children }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span className="text-legenda text-texto-secundario">{nome}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const ORDENACAO = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'menor', rotulo: 'Menor preço' },
  { valor: 'maior', rotulo: 'Maior preço' },
];
const ESTADOS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
  .map((uf) => ({ valor: uf, rotulo: uf }));

// Formulário de endereço com os rótulos reais do checkout: comprido o bastante para a gaveta rolar.
function CamposEndereco() {
  return (
    <div className="grid gap-4">
      <Campo rotulo="CEP" placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" />
      <Campo rotulo="Rua / Quadra" autoComplete="address-line1" />
      <div className="grid grid-cols-2 gap-4">
        <Campo rotulo="Número" inputMode="numeric" />
        <Campo rotulo="Complemento" opcional />
      </div>
      <Campo rotulo="Bairro" />
      <Campo rotulo="Cidade" autoComplete="address-level2" />
      <Seletor rotulo="Estado (UF)" opcoes={ESTADOS} placeholder="Selecione o estado" />
      <Campo rotulo="Telefone de Contato" type="tel" autoComplete="tel" placeholder="(61) 90000-0000" />
      <Campo rotulo="CPF do comprador" inputMode="numeric" placeholder="000.000.000-00" />
    </div>
  );
}

function DemonstracaoAvisos() {
  const { avisar } = useAvisos();
  return (
    <>
      <Botao variante="secundario" onClick={() => avisar({ tom: 'sucesso', titulo: 'Produto adicionado ao carrinho', acao: { rotulo: 'Desfazer', textoAlternativo: 'Remover o produto do carrinho' } })}>Sucesso com ação</Botao>
      <Botao variante="secundario" onClick={() => avisar({ tom: 'erro', titulo: 'Não foi possível calcular o frete', descricao: 'Confira o CEP e tente de novo.' })}>Erro</Botao>
      <Botao variante="secundario" onClick={() => avisar({ tom: 'info', titulo: 'Endereço salvo' })}>Informação</Botao>
    </>
  );
}

function ComponentesInterativos() {
  const [ordem, setOrdem] = useState('recentes');
  const [colunas, setColunas] = useState({ status: true, pagamento: true, data: false });
  const [ultimaAcao, setUltimaAcao] = useState('nenhuma');
  const [lado, setLado] = useState('direita');
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const cancelar = useRef(null);

  return (
    <>
      <Linha titulo="Seletor">
        <Seletor className="w-full sm:w-56" rotulo="Ordenar por" opcoes={ORDENACAO} valor={ordem} onValorMudar={setOrdem} />
        <Seletor className="w-full sm:w-56" rotulo="Estado (UF)" opcoes={ESTADOS} placeholder="Selecione o estado" erro="Selecione o estado." />
        <Seletor className="w-full sm:w-56" rotulo="Ordenar por (bloqueado)" opcoes={ORDENACAO} valorPadrao="menor" desabilitado />
      </Linha>

      <Linha titulo="Menu">
        <Estado nome="Ações">
          <Menu rotulo="Ações do pedido" gatilho={<Botao variante="secundario" iconeDepois={<Ellipsis size={16} />}>Ações</Botao>}>
            <MenuItem icone={<Eye />} onSelecionar={() => setUltimaAcao('Ver detalhes')}>Ver detalhes</MenuItem>
            <MenuItem icone={<Copy />} onSelecionar={() => setUltimaAcao('Copiar código')}>Copiar código</MenuItem>
            <MenuItem icone={<Truck />} desabilitado>Rastrear entrega</MenuItem>
            <MenuSeparador />
            <MenuItem icone={<XCircle />} destrutivo onSelecionar={() => setUltimaAcao('Cancelar pedido')}>Cancelar pedido</MenuItem>
          </Menu>
        </Estado>
        <Estado nome="Opções marcáveis">
          <Menu rotulo="Colunas da tabela" alinhamento="end" gatilho={<BotaoIcone rotulo="Colunas da tabela" variante="contorno"><SlidersHorizontal size={18} /></BotaoIcone>}>
            <MenuRotulo>Mostrar colunas</MenuRotulo>
            <MenuOpcao marcado={colunas.status} onMarcadoMudar={(v) => setColunas((c) => ({ ...c, status: v }))}>Status</MenuOpcao>
            <MenuOpcao marcado={colunas.pagamento} onMarcadoMudar={(v) => setColunas((c) => ({ ...c, pagamento: v }))}>Pagamento</MenuOpcao>
            <MenuOpcao marcado={colunas.data} onMarcadoMudar={(v) => setColunas((c) => ({ ...c, data: v }))}>Data</MenuOpcao>
          </Menu>
        </Estado>
        <p className="w-full text-legenda text-texto-secundario" data-teste="ultima-acao">Última ação: {ultimaAcao}</p>
      </Linha>

      <Linha titulo="Diálogo">
        <Dialogo
          titulo="Remover produto do carrinho?"
          descricao="O produto sai do carrinho, mas continua nos seus favoritos."
          focoInicial={cancelar}
          gatilho={<Botao variante="destrutivo" iconeAntes={<Trash2 size={16} />}>Remover</Botao>}
          rodape={(
            <>
              <DialogoFechar><Botao ref={cancelar} variante="discreto">Cancelar</Botao></DialogoFechar>
              <DialogoFechar><Botao variante="destrutivo">Remover</Botao></DialogoFechar>
            </>
          )}
        >
          <p className="text-auxiliar text-texto-secundario">Foco inicial em “Cancelar”, a ação segura.</p>
        </Dialogo>
        <Dialogo
          titulo="Ordenar produtos"
          gatilho={<Botao variante="secundario">Seletor dentro do diálogo</Botao>}
          rodape={<DialogoFechar><Botao>Aplicar</Botao></DialogoFechar>}
        >
          <Seletor rotulo="Ordenar por" opcoes={ORDENACAO} valor={ordem} onValorMudar={setOrdem} />
        </Dialogo>
      </Linha>

      <Linha titulo="Gaveta">
        <Botao variante="secundario" onClick={() => { setLado('direita'); setGavetaAberta(true); }}>Endereço (lateral)</Botao>
        <Botao variante="secundario" onClick={() => { setLado('baixo'); setGavetaAberta(true); }}>Endereço (de baixo)</Botao>
        <Gaveta
          lado={lado}
          aberto={gavetaAberta}
          onAbertoMudar={setGavetaAberta}
          titulo="Endereço de entrega"
          descricao="Só a área do formulário rola; a página atrás fica parada."
          rodape={(
            <>
              <DialogoFechar><Botao variante="discreto">Cancelar</Botao></DialogoFechar>
              <DialogoFechar><Botao>Salvar endereço</Botao></DialogoFechar>
            </>
          )}
        >
          <CamposEndereco />
        </Gaveta>
      </Linha>

      <Linha titulo="Popover">
        <Popover titulo="Faixa de preço" gatilho={<Botao variante="secundario">Preço</Botao>}>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Mínimo" inputMode="decimal" placeholder="R$ 0" />
            <Campo rotulo="Máximo" inputMode="decimal" placeholder="R$ 2.000" />
          </div>
          <Botao className="mt-4" larguraTotal tamanho="sm">Aplicar preço</Botao>
        </Popover>
      </Linha>

      <Linha titulo="Dica">
        <Dica texto="Buscar produtos"><BotaoIcone rotulo="Buscar produtos" variante="fantasma" tamanho="lg"><Search size={20} /></BotaoIcone></Dica>
        <Dica texto="Minha conta"><BotaoIcone rotulo="Minha conta" variante="fantasma" tamanho="lg"><User size={20} /></BotaoIcone></Dica>
        <Dica texto="Favoritos" lado="bottom"><BotaoIcone rotulo="Favoritos" variante="fantasma" tamanho="lg"><Heart size={20} /></BotaoIcone></Dica>
        <Dica texto="Carrinho" lado="bottom"><BotaoIcone rotulo="Carrinho" variante="fantasma" tamanho="lg"><ShoppingCart size={20} /></BotaoIcone></Dica>
      </Linha>

      <Linha titulo="Abas">
        <Abas
          className="w-full"
          rotulo="Informações do produto"
          abas={[
            { valor: 'descricao', rotulo: 'Descrição', conteudo: <p className="max-w-prose text-texto-secundario">O prazo de entrega começa a contar depois da confirmação do pagamento.</p> },
            { valor: 'avaliacoes', rotulo: 'Avaliações', conteudo: <p className="text-texto-secundario">Nenhuma avaliação ainda.</p> },
            { valor: 'perguntas', rotulo: 'Perguntas', conteudo: <p className="text-texto-secundario">Nenhuma pergunta ainda.</p> },
            { valor: 'trocas', rotulo: 'Trocas (indisponível)', conteudo: null, desabilitada: true },
          ]}
        />
        {/* Casos-limite: a primeira aba desabilitada começa na primeira habilitada; todas desabilitadas, nenhuma selecionada. */}
        <Abas
          className="w-full"
          rotulo="Primeira aba desabilitada"
          abas={[
            { valor: 'trocas', rotulo: 'Trocas (indisponível)', conteudo: null, desabilitada: true },
            { valor: 'descricao', rotulo: 'Descrição', conteudo: <p className="text-texto-secundario">Começa aqui: a primeira aba habilitada.</p> },
            { valor: 'perguntas', rotulo: 'Perguntas', conteudo: <p className="text-texto-secundario">Nenhuma pergunta ainda.</p> },
          ]}
        />
        <Abas
          className="w-full"
          rotulo="Todas as abas desabilitadas"
          abas={[
            { valor: 'trocas', rotulo: 'Trocas (indisponível)', conteudo: null, desabilitada: true },
            { valor: 'garantia', rotulo: 'Garantia (indisponível)', conteudo: null, desabilitada: true },
          ]}
        />
      </Linha>

      <Linha titulo="Aviso">
        <DemonstracaoAvisos />
      </Linha>
    </>
  );
}

export default function PranchaComponentes() {
  return (
    <ProvedorAvisos>
      <ProvedorDicas>
        <Prancha />
      </ProvedorDicas>
    </ProvedorAvisos>
  );
}

function Prancha() {
  const { tema } = useTema();
  const [favorito, setFavorito] = useState(false);
  const [quantidade, setQuantidade] = useState(4);
  const coracao = useRef(null);
  const carrinho = useRef(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-margem pb-secao pt-bloco">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-titulo-lg text-texto">Componentes base</h1>
          <p className="mt-1 text-auxiliar text-texto-secundario">Fases 1A e 1B · tema {tema} · página só de desenvolvimento</p>
        </div>
        <BotaoTema />
      </div>

      <Linha titulo="Cores">
        <ul className="grid w-full grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
          {CORES.map(([token, nome]) => (
            <li key={token} className="overflow-hidden rounded-cartao border border-borda bg-superficie">
              <div className={`h-12 border-b border-borda ${AMOSTRA[token]}`} />
              <div className="px-3 py-2">
                <p className="text-auxiliar font-semibold text-texto">{nome}</p>
                <p className="text-legenda text-texto-secundario">{token}</p>
              </div>
            </li>
          ))}
        </ul>
      </Linha>

      <Linha titulo="Tipografia">
        <div className="grid w-full gap-3">
          <p className="font-titulo text-display text-texto">NKG dos Importados</p>
          <p className="font-titulo text-titulo-lg text-texto">Relógios e acessórios importados</p>
          <p className="font-titulo text-titulo-md text-texto">Detalhes do produto</p>
          <p className="font-titulo text-titulo-sm text-texto">Perguntas sobre o produto</p>
          <p className="max-w-prose text-corpo text-texto">Calcule o frete com o seu CEP. O prazo de entrega começa a contar depois da confirmação do pagamento.</p>
          <p className="text-rotulo text-texto">CEP de entrega</p>
          <p className="text-auxiliar text-texto-secundario">Informe um CEP com 8 dígitos.</p>
          <p className="text-legenda text-texto-secundario">Acessórios</p>
          <div className="flex flex-wrap items-baseline gap-6">
            <Preco valor={1279.9} tamanho="destaque" className="font-titulo text-texto" />
            <Preco valor={679} tamanho="padrao" className="text-texto" />
            <Preco valor={899} anterior={1049} desconto="−14%" tamanho="padrao" className="text-texto" />
          </div>
        </div>
      </Linha>

      <Linha titulo="Botão principal">
        <Estado nome="Normal"><Botao>Adicionar ao carrinho</Botao></Estado>
        <Estado nome="Grande"><Botao tamanho="lg">Finalizar compra</Botao></Estado>
        <Estado nome="Pequeno"><Botao tamanho="sm">Salvar</Botao></Estado>
        <Estado nome="Carregando"><Botao carregando>Salvando...</Botao></Estado>
        <Estado nome="Desabilitado"><Botao disabled>Finalizar compra</Botao></Estado>
      </Linha>

      <Linha titulo="Outros botões">
        <Estado nome="Secundário"><Botao variante="secundario">Aplicar preço</Botao></Estado>
        <Estado nome="Secundário desabilitado"><Botao variante="secundario" disabled>Aplicar preço</Botao></Estado>
        <Estado nome="Discreto"><Botao variante="discreto">Cancelar</Botao></Estado>
        <Estado nome="Destrutivo"><Botao variante="destrutivo" iconeAntes={<Trash2 size={16} />}>Remover</Botao></Estado>
        <Estado nome="Com ícone"><Botao variante="secundario" iconeAntes={<Truck size={16} />}>Calcular frete</Botao></Estado>
      </Linha>

      <Linha titulo="Botões de ícone">
        <Estado nome="Fantasma">
          <BotaoIcone rotulo="Buscar produtos" variante="fantasma" tamanho="lg"><Search size={20} /></BotaoIcone>
          <BotaoIcone rotulo="Minha conta" variante="fantasma" tamanho="lg"><User size={20} /></BotaoIcone>
          <BotaoTema />
        </Estado>
        <Estado nome="Neutro (sobre foto)">
          <BotaoIcone rotulo="Adicionar aos favoritos" tamanho="sm"><Heart size={16} /></BotaoIcone>
        </Estado>
        <Estado nome="Contorno">
          <BotaoIcone rotulo="Diminuir quantidade" variante="contorno" disabled={quantidade <= 1} onClick={() => setQuantidade((q) => Math.max(1, q - 1))}><Minus size={18} /></BotaoIcone>
          <span className="min-w-6 text-center text-corpo font-semibold tabular-nums text-texto" aria-live="polite">{quantidade}</span>
          <BotaoIcone rotulo="Aumentar quantidade" variante="contorno" onClick={() => setQuantidade((q) => q + 1)}><Plus size={18} /></BotaoIcone>
        </Estado>
        <Estado nome="Animados (clique)">
          <BotaoIcone
            rotulo={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            pressionado={favorito}
            variante={favorito ? 'marca' : 'contorno'}
            onClick={(evento) => { setFavorito((f) => !f); if (veioDoPonteiro(evento)) coracao.current?.pulsar(); }}
          >
            <IconeCoracao ref={coracao} tamanho={18} preenchido={favorito} />
          </BotaoIcone>
          <BotaoIcone rotulo="Adicionar ao carrinho" variante="neutro" onClick={(evento) => { if (veioDoPonteiro(evento)) carrinho.current?.pulsar(); }}>
            <IconeCarrinho ref={carrinho} tamanho={18} />
          </BotaoIcone>
        </Estado>
        <Estado nome="Lucide (estáticos)">
          <span className="flex gap-3 text-texto-secundario" aria-hidden="true"><Search size={20} /><User size={20} /><ShoppingCart size={20} /><Heart size={20} /><Truck size={20} /></span>
        </Estado>
      </Linha>

      <Linha titulo="Campo">
        <Campo className="w-full sm:w-56" rotulo="CEP de entrega" placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" />
        <Campo className="w-full sm:w-56" rotulo="E-mail" type="email" autoComplete="email" ajuda="Usado para enviar o status do pedido." />
        <Campo className="w-full sm:w-56" rotulo="CEP" defaultValue="87" erro="Informe um CEP com 8 dígitos." />
        <Campo className="w-full sm:w-56" rotulo="CEP (bloqueado)" defaultValue="87000-000" disabled />
        <Campo className="w-full sm:w-56" rotulo="Ordenar por" as="select" defaultValue="recentes">
          <option value="recentes">Mais recentes</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </Campo>
        <Campo className="w-full sm:w-[29rem]" rotulo="Sua pergunta" as="textarea" opcional placeholder="Escreva sua dúvida sobre o produto" />
      </Linha>

      <Linha titulo="Selo de status">
        <SeloStatus status="pago">Pago</SeloStatus>
        <SeloStatus status="pendente">Aguardando pagamento</SeloStatus>
        <SeloStatus status="cancelado">Cancelado</SeloStatus>
        <SeloStatus tom="info">Enviado</SeloStatus>
        <SeloStatus status="outro">Rascunho</SeloStatus>
      </Linha>

      <Linha titulo="Superfícies">
        <Superficie className="w-full sm:w-60"><p className="text-rotulo text-texto">Cartão</p><p className="mt-1 text-auxiliar text-texto-secundario">Borda discreta, sombra mínima no claro.</p></Superficie>
        <Superficie nivel="elevada" className="w-full sm:w-60"><p className="text-rotulo text-texto">Auxiliar</p><p className="mt-1 text-auxiliar text-texto-secundario">Agrupamento secundário.</p></Superficie>
        <Superficie sombra className="w-full sm:w-60"><p className="text-rotulo text-texto">Com sombra</p><p className="mt-1 text-auxiliar text-texto-secundario">Menus e painéis flutuantes.</p></Superficie>
      </Linha>

      <h2 className="mt-bloco font-titulo text-titulo-md text-texto">Componentes interativos</h2>
      <ComponentesInterativos />
    </div>
  );
}
