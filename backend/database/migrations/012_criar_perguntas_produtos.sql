CREATE TABLE IF NOT EXISTS perguntas_produtos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  pergunta VARCHAR(600) NOT NULL,
  resposta VARCHAR(1000) NULL,
  respondida_por_id INT NULL,
  respondida_em DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (respondida_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_perguntas_produto (produto_id, criado_em)
);
