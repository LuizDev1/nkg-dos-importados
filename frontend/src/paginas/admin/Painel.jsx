import { useEffect, useState } from 'react';
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
  const [estoqueBaixo, setEstoqueBaixo] = useState([]);
  const [erroEstoque, setErroEstoque] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/produtos/estoque-baixo`, {
      headers: { Authorization: `Bearer ${token || ''}` },
    }).then(async resposta => {
      if (!resposta.ok) throw new Error('Não foi possível carregar os alertas de estoque.');
      return resposta.json();
    }).then(setEstoqueBaixo).catch(erro => setErroEstoque(erro.message));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-9">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#b99a42]">Gestão da loja</p>
        <h1 className="text-3xl font-bold">Painel administrativo</h1>
        <p className="mt-2 text-sm text-gray-500">Gerencie as principais áreas da NKG dos Importados.</p>
      </div>

      <section className="mb-8 rounded border border-[#5a4820] bg-[#1b1a13] p-5" aria-labelledby="titulo-estoque-baixo">
        <h2 id="titulo-estoque-baixo" className="font-semibold text-[#d4af45]">Alerta de estoque baixo</h2>
        {erroEstoque ? <p role="alert" className="mt-2 text-sm text-red-400">{erroEstoque}</p>
          : estoqueBaixo.length === 0 ? <p className="mt-2 text-sm text-gray-400">Nenhum produto abaixo do limite configurado.</p>
          : <ul className="mt-3 space-y-2">{estoqueBaixo.map(produto => (
            <li key={`${produto.id}:${produto.variacao_id || 'produto'}`} className="flex flex-wrap justify-between gap-2 text-sm">
              <span>{produto.nome}{produto.variacao_nome ? ` · ${produto.variacao_nome}` : ''}</span>
              <span className="flex items-center gap-4 text-[#d4af45]">
                {produto.estoque_qtd} {Number(produto.estoque_qtd) === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                <Link to={`/admin/produtos?editar=${produto.id}${produto.variacao_id ? `&variacao=${produto.variacao_id}` : ''}`} className="rounded border border-[#d4af45] px-2 py-1 font-semibold hover:bg-[#d4af45] hover:text-[#111210]">Gerenciar</Link>
              </span>
            </li>
          ))}</ul>}
      </section>

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
