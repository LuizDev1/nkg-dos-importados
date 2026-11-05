import { formatarMoeda } from '../../servicos/formatadores.mjs';
import { PRECO_TAMANHOS } from './estilos.mjs';

// Valor monetário em real, sempre com algarismos tabulares. Não calcula nada:
// `anterior` é o preço original já informado e `desconto` é um texto pronto (ex.: "−20%").
export default function Preco({ valor, anterior, desconto, tamanho = 'herdar', as: Elemento = 'span', className = '' }) {
  const tamanhoClasse = PRECO_TAMANHOS[tamanho] ?? '';
  const temAnterior = anterior !== undefined && anterior !== null && anterior !== '';

  if (!temAnterior && !desconto) {
    return <Elemento className={`tabular-nums ${tamanhoClasse} ${className}`.trim()}>{formatarMoeda(valor)}</Elemento>;
  }

  return (
    <Elemento className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`.trim()}>
      <span className={`tabular-nums ${tamanhoClasse}`.trim()}>
        {temAnterior && <span className="sr-only">Preço promocional: </span>}
        {formatarMoeda(valor)}
      </span>
      {temAnterior && (
        <s className="text-auxiliar font-normal text-texto-discreto tabular-nums">
          <span className="sr-only">Preço anterior: </span>
          {formatarMoeda(anterior)}
        </s>
      )}
      {desconto && (
        <span className="rounded-pilula bg-marca-suave px-2 py-0.5 text-legenda font-semibold text-marca-clara tabular-nums">{desconto}</span>
      )}
    </Elemento>
  );
}
