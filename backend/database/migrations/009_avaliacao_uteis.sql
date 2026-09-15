CREATE TABLE IF NOT EXISTS avaliacao_uteis (
  usuario_id INT NOT NULL,
  avaliacao_id INT NOT NULL,
  PRIMARY KEY (usuario_id, avaliacao_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
);
