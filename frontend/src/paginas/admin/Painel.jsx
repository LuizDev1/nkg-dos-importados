import { Link } from 'react-router-dom';

const SECOES = [
  ['/admin/produtos', 'Produtos', 'Catálogo, estoque e variações', 'P'],
  ['/admin/pedidos', 'Pedidos', 'Pagamentos, envio e atendimento', 'V'],
  ['/admin/relatorios', 'Relatórios', 'Indicadores e desempenho da loja', 'R'],
  ['/admin/configuracoes', 'Configurações', 'Contato e informações gerais', 'C'],
  ['/admin/promocoes', 'Promoções', 'Cupons e campanhas comerciais', '%'],
  ['/admin/banners', 'Banners', 'Destaques visuais da vitrine', 'B'],
  ['/admin/perguntas', 'Perguntas', 'Dúvidas enviadas pelos clientes', '?'],
  ['/admin/clientes', 'Clientes', 'Contas e histórico de compras', 'U'],
];

export default function Painel() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-9">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#b99a42]">Gestão da loja</p>
        <h1 className="text-3xl font-bold">Painel administrativo</h1>
        <p className="mt-2 text-sm text-gray-500">Gerencie as principais áreas da NKG dos Importados.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECOES.map(([rota, titulo, descricao]) => (
          <Link key={rota} to={rota} className="admin-card group rounded border border-[#2b281f] bg-[#111210] p-5">
            <h2 className="font-semibold text-[#f4efe5] group-hover:text-[#d4af45]">{titulo}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
