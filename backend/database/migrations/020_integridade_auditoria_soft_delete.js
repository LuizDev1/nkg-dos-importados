async function colunaExiste(pool, tabela, coluna) {
  const [linhas] = await pool.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tabela, coluna]
  );
  return linhas.length > 0;
}

async function indiceExiste(pool, tabela, indice) {
  const [linhas] = await pool.query(
    `SELECT 1
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tabela, indice]
  );
  return linhas.length > 0;
}

async function restricaoExiste(pool, tabela, restricao) {
  const [linhas] = await pool.query(
    `SELECT 1
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
    [tabela, restricao]
  );
  return linhas.length > 0;
}

async function chaveEstrangeiraExiste(pool, tabela, coluna, tabelaReferenciada) {
  const [linhas] = await pool.query(
    `SELECT 1
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE CONSTRAINT_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
       AND REFERENCED_TABLE_NAME = ?`,
    [tabela, coluna, tabelaReferenciada]
  );
  return linhas.length > 0;
}

async function adicionarColuna(pool, tabela, coluna, definicao) {
  if (!await colunaExiste(pool, tabela, coluna)) {
    await pool.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao}`);
  }
}

async function adicionarIndice(pool, tabela, nome, colunas, unico = false) {
  if (!await indiceExiste(pool, tabela, nome)) {
    await pool.query(`ALTER TABLE \`${tabela}\` ADD ${unico ? 'UNIQUE ' : ''}INDEX \`${nome}\` (${colunas})`);
  }
}

async function adicionarCheck(pool, tabela, nome, expressao) {
  if (!await restricaoExiste(pool, tabela, nome)) {
    await pool.query(`ALTER TABLE \`${tabela}\` ADD CONSTRAINT \`${nome}\` CHECK (${expressao})`);
  }
}

async function adicionarChaveEstrangeira(pool, tabela, coluna, tabelaReferenciada, nome, aoExcluir) {
  if (!await chaveEstrangeiraExiste(pool, tabela, coluna, tabelaReferenciada)) {
    await pool.query(
      `ALTER TABLE \`${tabela}\`
       ADD CONSTRAINT \`${nome}\` FOREIGN KEY (\`${coluna}\`)
       REFERENCES \`${tabelaReferenciada}\` (id) ON DELETE ${aoExcluir}`
    );
  }
}

async function adicionarChaveEstrangeiraComposta(pool, tabela, colunas, tabelaReferenciada, colunasReferenciadas, nome, aoExcluir) {
  if (!await restricaoExiste(pool, tabela, nome)) {
    await pool.query(
      `ALTER TABLE \`${tabela}\`
       ADD CONSTRAINT \`${nome}\` FOREIGN KEY (${colunas})
       REFERENCES \`${tabelaReferenciada}\` (${colunasReferenciadas}) ON DELETE ${aoExcluir}`
    );
  }
}

async function removerChaveEstrangeiraSimples(pool, tabela, coluna) {
  const [linhas] = await pool.query(
    `SELECT k.CONSTRAINT_NAME
     FROM information_schema.KEY_COLUMN_USAGE k
     WHERE k.CONSTRAINT_SCHEMA = DATABASE()
       AND k.TABLE_NAME = ?
       AND k.REFERENCED_TABLE_NAME IS NOT NULL
     GROUP BY k.CONSTRAINT_NAME
     HAVING COUNT(*) = 1 AND MAX(k.COLUMN_NAME = ?) = 1`,
    [tabela, coluna]
  );
  for (const linha of linhas) {
    await pool.query(`ALTER TABLE \`${tabela}\` DROP FOREIGN KEY \`${linha.CONSTRAINT_NAME}\``);
  }
}

module.exports = async pool => {
  await adicionarColuna(pool, 'produtos', 'excluido_em', 'DATETIME NULL AFTER ativo');
  await adicionarColuna(pool, 'produto_variacoes', 'excluido_em', 'DATETIME NULL AFTER ativo');
  await adicionarColuna(pool, 'banners', 'excluido_em', 'DATETIME NULL AFTER ativo');
  await adicionarColuna(pool, 'enderecos_usuarios', 'excluido_em', 'DATETIME NULL AFTER principal');
  await adicionarColuna(
    pool,
    'avisos_estoque',
    'variacao_referencia_id',
    'INT GENERATED ALWAYS AS (NULLIF(variacao_id, 0)) STORED AFTER variacao_id'
  );

  await pool.query(
    `UPDATE itens_pedido ip
     LEFT JOIN produto_variacoes pv ON pv.id = ip.variacao_id AND pv.produto_id = ip.produto_id
     SET ip.variacao_id = NULL
     WHERE ip.variacao_id IS NOT NULL AND pv.id IS NULL`
  );
  await pool.query(
    `DELETE ae
     FROM avisos_estoque ae
     LEFT JOIN produto_variacoes pv ON pv.id = ae.variacao_id AND pv.produto_id = ae.produto_id
     WHERE ae.variacao_id <> 0 AND pv.id IS NULL`
  );
  await pool.query(
    `UPDATE movimentacoes_estoque me
     LEFT JOIN usuarios u ON u.id = me.usuario_id
     SET me.usuario_id = NULL
     WHERE me.usuario_id IS NOT NULL AND u.id IS NULL`
  );
  await pool.query(
    `UPDATE logs l
     LEFT JOIN usuarios u ON u.id = l.usuario_id
     SET l.usuario_id = NULL
     WHERE l.usuario_id IS NOT NULL AND u.id IS NULL`
  );

  await removerChaveEstrangeiraSimples(pool, 'itens_pedido', 'variacao_id');
  await adicionarChaveEstrangeira(pool, 'movimentacoes_estoque', 'usuario_id', 'usuarios', 'fk_movimentacoes_usuario', 'SET NULL');
  await adicionarChaveEstrangeira(pool, 'logs', 'usuario_id', 'usuarios', 'fk_logs_usuario', 'SET NULL');

  await adicionarIndice(pool, 'usuarios', 'idx_usuarios_perfil_criado', '`perfil`, `criado_em`');
  await adicionarIndice(pool, 'usuarios', 'idx_usuarios_status', '`status`');
  await adicionarIndice(pool, 'produtos', 'idx_produtos_ativos_categoria', '`ativo`, `excluido_em`, `categoria`');
  await adicionarIndice(pool, 'produtos', 'idx_produtos_ativos_criado', '`ativo`, `excluido_em`, `criado_em`');
  await adicionarIndice(pool, 'produto_variacoes', 'idx_variacoes_ativas', '`produto_id`, `ativo`, `excluido_em`');
  await adicionarIndice(pool, 'produto_variacoes', 'uq_variacoes_produto_id', '`produto_id`, `id`', true);
  await adicionarIndice(pool, 'pedidos', 'idx_pedidos_usuario_criado', '`usuario_id`, `criado_em`');
  await adicionarIndice(pool, 'pedidos', 'idx_pedidos_payment_id', '`payment_id`');
  await adicionarIndice(pool, 'pedidos', 'idx_pedidos_criado', '`criado_em`');
  await adicionarIndice(pool, 'itens_pedido', 'idx_itens_produto_pedido', '`produto_id`, `pedido_id`');
  await adicionarIndice(pool, 'avaliacoes', 'idx_avaliacoes_produto_criado', '`produto_id`, `criado_em`');
  await adicionarIndice(pool, 'avisos_estoque', 'idx_avisos_produto_variacao', '`produto_id`, `variacao_id`');
  await adicionarIndice(pool, 'banners', 'idx_banners_listagem', '`excluido_em`, `ativo`, `principal`, `ordem`, `criado_em`');
  await adicionarIndice(pool, 'logs', 'idx_logs_usuario_criado', '`usuario_id`, `criado_em`');
  await adicionarIndice(pool, 'promocoes', 'idx_promocoes_validade', '`ativo`, `inicio_em`, `fim_em`');

  await adicionarChaveEstrangeiraComposta(pool, 'itens_pedido', '`produto_id`, `variacao_id`', 'produto_variacoes', '`produto_id`, `id`', 'fk_itens_variacao_produto', 'RESTRICT');
  await adicionarChaveEstrangeiraComposta(pool, 'avisos_estoque', '`produto_id`, `variacao_referencia_id`', 'produto_variacoes', '`produto_id`, `id`', 'fk_avisos_variacao_produto', 'CASCADE');

  await adicionarCheck(pool, 'usuarios', 'chk_usuarios_email', "email LIKE '_%@_%._%'");
  await adicionarCheck(pool, 'produtos', 'chk_produtos_valores', 'preco >= 0 AND estoque_qtd >= 0 AND estoque_minimo >= 0');
  await adicionarCheck(pool, 'produtos', 'chk_produtos_dimensoes', 'peso_kg > 0 AND largura_cm > 0 AND altura_cm > 0 AND comprimento_cm > 0');
  await adicionarCheck(pool, 'produtos', 'chk_produtos_soft_delete', 'excluido_em IS NULL OR ativo = FALSE');
  await adicionarCheck(pool, 'produto_variacoes', 'chk_variacoes_estoque', 'estoque_qtd >= 0');
  await adicionarCheck(pool, 'produto_variacoes', 'chk_variacoes_soft_delete', 'excluido_em IS NULL OR ativo = FALSE');
  await adicionarCheck(pool, 'movimentacoes_estoque', 'chk_movimentacoes_quantidade', 'quantidade > 0 AND saldo_anterior >= 0 AND saldo_posterior >= 0');
  await adicionarCheck(pool, 'avaliacoes', 'chk_avaliacoes_nota', 'nota BETWEEN 1 AND 5');
  await adicionarCheck(pool, 'pedidos', 'chk_pedidos_valores', 'subtotal >= 0 AND frete >= 0 AND desconto >= 0 AND total >= 0 AND desconto <= subtotal + frete');
  await adicionarCheck(pool, 'itens_pedido', 'chk_itens_pedido_valores', 'quantidade > 0 AND preco_unitario >= 0');
  await adicionarCheck(pool, 'promocoes', 'chk_promocoes_valor', 'valor > 0 AND usos >= 0 AND (uso_maximo IS NULL OR (uso_maximo > 0 AND usos <= uso_maximo))');
  await adicionarCheck(pool, 'promocoes', 'chk_promocoes_periodo', 'inicio_em IS NULL OR fim_em IS NULL OR fim_em >= inicio_em');
  await adicionarCheck(pool, 'banners', 'chk_banners_posicao', 'posicao_x BETWEEN 0 AND 100 AND posicao_y BETWEEN 0 AND 100 AND posicao_x_2 BETWEEN 0 AND 100 AND posicao_y_2 BETWEEN 0 AND 100');
  await adicionarCheck(pool, 'banners', 'chk_banners_zoom', 'zoom BETWEEN 50 AND 150 AND zoom_2 BETWEEN 50 AND 150');
  await adicionarCheck(pool, 'banners', 'chk_banners_soft_delete', 'excluido_em IS NULL OR (ativo = FALSE AND principal = FALSE)');
  await adicionarCheck(pool, 'enderecos_usuarios', 'chk_enderecos_soft_delete', 'excluido_em IS NULL OR principal = FALSE');
};
