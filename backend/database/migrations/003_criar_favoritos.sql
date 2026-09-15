USE nkg_importados;

CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, produto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
