const test = require('node:test');
const assert = require('node:assert/strict');
const { schemas } = require('../src/middlewares/validacao');

const produtoBase = {
  nome: 'Produto seguro', preco: 10, estoque_qtd: 1,
  peso_kg: 0.3, largura_cm: 20, altura_cm: 10, comprimento_cm: 30,
};

test('URLs persistidas aceitam somente HTTP e HTTPS', () => {
  assert.equal(schemas.produto.safeParse({ ...produtoBase, foto_url: 'https://cdn.exemplo.com/foto.png' }).success, true);
  assert.equal(schemas.produto.safeParse({ ...produtoBase, foto_url: 'javascript:alert(1)' }).success, false);
  assert.equal(schemas.banner.safeParse({ imagem_url: 'data:text/html,<script>alert(1)</script>' }).success, false);
});

test('schemas estritos bloqueiam adulteração de campos', () => {
  const cadastro = {
    nome: 'Cliente Teste', email: 'cliente@exemplo.com', cpf: '529.982.247-25',
    senha: 'Senha@2026', perfil: 'admin',
  };
  assert.equal(schemas.autenticacao.safeParse(cadastro).success, false);
  assert.equal(schemas.pedido.safeParse({
    tipo_entrega: 'entrega_local', endereco_entrega: 'Rua Teste, 1',
    telefone_contato: '11999999999', itens: [{ produto_id: 1, quantidade: 1 }],
    total: 0.01,
  }).success, false);
});
