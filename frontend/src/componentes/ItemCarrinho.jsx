import { Link } from 'react-router-dom';
import Botao from './ui/Botao';
import Preco from './ui/Preco';
import { classesSuperficie } from './ui/estilos.mjs';

export default function ItemCarrinho({ item, onAlterarQuantidade, onRemover, carregandoEstoque = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${classesSuperficie({ espacamento: 'compacto', sombra: true })}`}>
      {item.foto_url ? (
        <img src={item.foto_url} alt={item.nome} className="w-16 h-16 shrink-0 object-cover rounded" />
      ) : (
        <div role="img" aria-label={`Imagem indisponível de ${item.nome}`} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-controle bg-superficie-destaque text-center text-legenda text-texto-secundario">Sem imagem</div>
      )}
      <div className="min-w-0 flex-1 basis-40">
        <Link
          to={`/produto/${item.produto_id}`}
          className="font-semibold hover:text-marca-texto hover:underline"
        >
          {item.nome}
        </Link>
        {item.variacao_nome && <p className="text-sm text-texto-secundario">{item.variacao_nome}</p>}
        <Preco valor={item.preco} as="p" className="text-sm text-texto-secundario" />
      </div>
      <div className="flex items-end gap-4">
        <label className="text-xs text-texto-secundario">
          Quantidade
        <input
          type="number"
          name={`quantidade-${item.chave}`}
          inputMode="numeric"
          min="1"
          max={item.estoque_qtd}
          step="1"
          disabled={carregandoEstoque || !item.estoque_qtd}
          value={item.quantidade}
          onChange={(e) => onAlterarQuantidade(item.chave, Number(e.target.value))}
          className="mt-2 block w-20 border rounded px-2 py-1 text-center text-base"
        />
        </label>
        <Botao variante="destrutivo" tamanho="sm" onClick={() => onRemover(item.chave)} aria-label={`Remover ${item.nome}${item.variacao_nome ? ` (${item.variacao_nome})` : ''}`}>
          Remover
        </Botao>
      </div>
    </div>
  );
}
