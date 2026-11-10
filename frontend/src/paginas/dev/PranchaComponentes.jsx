import { Heart, Minus, Plus, Search, ShoppingCart, Trash2, Truck, User } from 'lucide-react';
import { useRef, useState } from 'react';
import Botao from '../../componentes/ui/Botao';
import BotaoIcone from '../../componentes/ui/BotaoIcone';
import BotaoTema from '../../componentes/ui/BotaoTema';
import Campo from '../../componentes/ui/Campo';
import Preco from '../../componentes/ui/Preco';
import SeloStatus from '../../componentes/ui/SeloStatus';
import Superficie from '../../componentes/ui/Superficie';
import { IconeCarrinho, IconeCoracao, veioDoPonteiro } from '../../componentes/icones/animados/IconesAnimados';
import { useTema } from '../../contextos/ContextoTema';

// Prancha da fase 1A: tokens, tipografia, ícones e primitivas nos dois temas.
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

export default function PranchaComponentes() {
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
          <p className="mt-1 text-auxiliar text-texto-secundario">Fase 1A · tema {tema} · página só de desenvolvimento</p>
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
    </div>
  );
}
