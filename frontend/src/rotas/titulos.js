// Título do documento por rota (o sufixo " · NKG dos Importados" é acrescentado em App.jsx).
const TITULOS = [
  [/^\/$/, 'Loja'],
  [/^\/login$/, 'Entrar'],
  [/^\/cadastro$/, 'Criar conta'],
  [/^\/carrinho$/, 'Carrinho'],
  [/^\/checkout$/, 'Finalizar compra'],
  [/^\/produto\/[^/]+$/, 'Produto'],
  [/^\/pedido\/[^/]+\/[^/]+$/, 'Status do pedido'],
  [/^\/privacidade$/, 'Privacidade e dados pessoais'],
  [/^\/favoritos$/, 'Favoritos'],
  [/^\/minha-conta$/, 'Minha conta'],
  [/^\/minha-conta\/pedidos$/, 'Meus pedidos'],
  [/^\/minha-conta\/pedidos\/[^/]+$/, 'Detalhe do pedido'],
  [/^\/admin$/, 'Painel administrativo'],
  [/^\/admin\/produtos$/, 'Produtos · Admin'],
  [/^\/admin\/pedidos$/, 'Pedidos · Admin'],
  [/^\/admin\/pedidos\/[^/]+$/, 'Detalhe do pedido · Admin'],
  [/^\/admin\/clientes$/, 'Clientes · Admin'],
  [/^\/admin\/clientes\/[^/]+$/, 'Detalhe do cliente · Admin'],
  [/^\/admin\/relatorios$/, 'Relatórios · Admin'],
  [/^\/admin\/configuracoes$/, 'Configurações · Admin'],
  [/^\/admin\/promocoes$/, 'Promoções · Admin'],
  [/^\/admin\/banners$/, 'Banners · Admin'],
  [/^\/admin\/perguntas$/, 'Perguntas · Admin'],
  [/^\/dev\/componentes$/, 'Componentes · Desenvolvimento'],
];

export function tituloDaRota(caminho) {
  return (TITULOS.find(([padrao]) => padrao.test(caminho)) || [null, 'Página não encontrada'])[1];
}
