USE nkg_importados;

CREATE TABLE IF NOT EXISTS produto_variacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  nome VARCHAR(120) NOT NULL,
  estoque_qtd INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_variacao_produto_nome (produto_id, nome)
);

ALTER TABLE itens_pedido ADD COLUMN variacao_id INT NULL AFTER produto_id;
ALTER TABLE itens_pedido ADD COLUMN variacao_nome VARCHAR(120) NULL AFTER variacao_id;
