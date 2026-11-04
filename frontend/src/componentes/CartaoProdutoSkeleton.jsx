export function CartaoProdutoSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-sm border border-[#2b2618]/70 bg-[#111210] p-0"
    >
      <div className="skeleton-shimmer h-52 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <div className="skeleton-shimmer mb-3 h-2.5 w-16 rounded-sm" />
        <div className="skeleton-shimmer mb-2 h-4 w-4/5 rounded-sm" />
        <div className="skeleton-shimmer mb-4 h-3.5 w-3/5 rounded-sm" />
        <div className="skeleton-shimmer mb-4 h-3 w-20 rounded-sm" />
        <div className="skeleton-shimmer mt-auto h-5 w-28 rounded-sm" />
      </div>
    </article>
  );
}

export default function GradeProdutosSkeleton({ quantidade = 8 }) {
  return (
    <div
      role="status"
      aria-label="Carregando catálogo de produtos"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: quantidade }).map((_, index) => (
        <CartaoProdutoSkeleton key={index} />
      ))}
      <span className="sr-only">Carregando catálogo de produtos...</span>
    </div>
  );
}
