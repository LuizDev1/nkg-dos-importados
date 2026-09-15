USE nkg_importados;

CREATE TABLE IF NOT EXISTS avisos_estoque (
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  variacao_id INT NOT NULL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, produto_id, variacao_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
