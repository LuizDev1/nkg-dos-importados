USE nkg_importados;

CREATE TABLE IF NOT EXISTS produto_imagens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  imagem_url VARCHAR(500) NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  INDEX idx_produto_imagens_ordem (produto_id, ordem)
);
