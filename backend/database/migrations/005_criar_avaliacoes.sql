USE nkg_importados;

CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  nota TINYINT NOT NULL,
  comentario VARCHAR(1000) NOT NULL DEFAULT '',
  foto_url VARCHAR(500) NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_avaliacao_usuario_produto (usuario_id, produto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
