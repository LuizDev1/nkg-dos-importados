// Consulta a estrutura antes de alterar: também atende bancos ajustados manualmente.
module.exports = async function migrar(pool) {
  async function colunas(tabela) {
    const [linhas] = await pool.query(`SHOW COLUMNS FROM \`${tabela}\``);
    return new Set(linhas.map((linha) => linha.Field));
  }

  async function adicionar(tabela, existentes, nome, definicao) {
    if (existentes.has(nome)) return false;
    await pool.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${nome}\` ${definicao}`);
    existentes.add(nome);
    return true;
  }

  const produtos = await colunas('produtos');
  for (const [nome, definicao] of Object.entries({
    peso_kg: 'DECIMAL(8,3) NOT NULL DEFAULT 0.300',
    largura_cm: 'DECIMAL(8,2) NOT NULL DEFAULT 20',
    altura_cm: 'DECIMAL(8,2) NOT NULL DEFAULT 10',
    comprimento_cm: 'DECIMAL(8,2) NOT NULL DEFAULT 30',
  })) await adicionar('produtos', produtos, nome, definicao);

  const pedidos = await colunas('pedidos');
  await adicionar('pedidos', pedidos, 'idempotency_key', 'VARCHAR(100) NULL');

  // Preenche dados históricos somente quando cria cada coluna.
  if (await adicionar('pedidos', pedidos, 'status_pedido',
    "ENUM('aguardando_pagamento','pago','em_preparacao','enviado','entregue','cancelado','reembolso_pendente','reembolsado') NOT NULL DEFAULT 'aguardando_pagamento'")) {
    await pool.query(`UPDATE pedidos SET status_pedido = CASE
      WHEN payment_status = 'pago' THEN 'pago'
      WHEN payment_status IN ('cancelado', 'recusado') THEN 'cancelado'
      ELSE 'aguardando_pagamento' END`);
  }
  // Não presume que o estoque de pedidos antigos ainda está reservado.
  await adicionar('pedidos', pedidos, 'estoque_reservado', 'BOOLEAN NOT NULL DEFAULT FALSE');
  for (const [nome, definicao] of Object.entries({
    cep_entrega: 'VARCHAR(8)',
    frete_servico_id: 'VARCHAR(30)',
    prazo_entrega_dias: 'INT',
    desconto: 'DECIMAL(10,2) NOT NULL DEFAULT 0',
    codigo_promocao: 'VARCHAR(50)',
  })) await adicionar('pedidos', pedidos, nome, definicao);

  if (await adicionar('pedidos', pedidos, 'frete', 'DECIMAL(10,2) NOT NULL DEFAULT 0')) {
    if (pedidos.has('valor_frete')) {
      await pool.query('UPDATE pedidos SET frete = COALESCE(valor_frete, 0)');
    }
  }
  if (await adicionar('pedidos', pedidos, 'subtotal', 'DECIMAL(10,2) NOT NULL DEFAULT 0')) {
    await pool.query('UPDATE pedidos SET subtotal = total - frete + desconto');
  }

  const [indices] = await pool.query('SHOW INDEX FROM pedidos');
  const nomes = new Set(indices.map((indice) => indice.Key_name));
  if (!nomes.has('uq_pedidos_usuario_idempotencia')) {
    await pool.query(`ALTER TABLE pedidos ADD UNIQUE KEY
      uq_pedidos_usuario_idempotencia (usuario_id, idempotency_key)`);
  }
  if (!nomes.has('idx_pedidos_status')) {
    await pool.query('ALTER TABLE pedidos ADD INDEX idx_pedidos_status (status_pedido, payment_status)');
  }

  await pool.query(`CREATE TABLE IF NOT EXISTS promocoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo ENUM('percentual', 'fixo') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    inicio_em DATETIME NULL,
    fim_em DATETIME NULL,
    uso_maximo INT NULL,
    usos INT NOT NULL DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};
