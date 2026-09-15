ALTER TABLE produtos ADD COLUMN estoque_minimo INT NOT NULL DEFAULT 5;
ALTER TABLE produto_variacoes ADD COLUMN atributos_json JSON NULL;

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  variacao_id INT NULL,
  tipo ENUM('entrada','saida','ajuste') NOT NULL,
  quantidade INT NOT NULL,
  saldo_anterior INT NOT NULL,
  saldo_posterior INT NOT NULL,
  motivo VARCHAR(255) NOT NULL DEFAULT '',
  usuario_id INT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (variacao_id) REFERENCES produto_variacoes(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_movimentacoes_produto (produto_id, criado_em)
);

CREATE TABLE IF NOT EXISTS atendimento_pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('interno','cliente') NOT NULL DEFAULT 'interno',
  mensagem VARCHAR(2000) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_atendimento_pedido (pedido_id, criado_em)
);
