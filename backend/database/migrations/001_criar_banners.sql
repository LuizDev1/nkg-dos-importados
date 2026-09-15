USE nkg_importados;

CREATE TABLE IF NOT EXISTS banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL DEFAULT '',
  imagem_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500) NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INT NOT NULL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO banners (titulo, imagem_url, link_url, ativo, ordem)
SELECT banner_titulo, banner_url, banner_link, TRUE, 0
FROM configuracoes_loja
WHERE id = 1 AND banner_url <> ''
  AND NOT EXISTS (SELECT 1 FROM banners);
