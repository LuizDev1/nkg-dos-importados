-- Schema do banco de dados - NKG dos Importados
-- MySQL

CREATE DATABASE IF NOT EXISTS nkg_importados;
USE nkg_importados;

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  cpf VARCHAR(14) NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  status ENUM('ativo', 'bloqueado') NOT NULL DEFAULT 'ativo',
  anonimizado_em DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuarios_perfil_criado (perfil, criado_em),
  INDEX idx_usuarios_status (status),
  CONSTRAINT chk_usuarios_email CHECK (email LIKE '_%@_%._%')
);

CREATE TABLE produtos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  categoria VARCHAR(100),
  preco DECIMAL(10,2) NOT NULL,
  tag VARCHAR(100),
  foto_url VARCHAR(255),
  estoque_qtd INT NOT NULL DEFAULT 0,
  peso_kg DECIMAL(8,3) NOT NULL DEFAULT 0.300,
  largura_cm DECIMAL(8,2) NOT NULL DEFAULT 20,
  altura_cm DECIMAL(8,2) NOT NULL DEFAULT 10,
  comprimento_cm DECIMAL(8,2) NOT NULL DEFAULT 30,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  excluido_em DATETIME NULL,
  estoque_minimo INT NOT NULL DEFAULT 5,
  tamanhos_json JSON NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_produtos_ativos_categoria (ativo, excluido_em, categoria),
  INDEX idx_produtos_ativos_criado (ativo, excluido_em, criado_em),
  CONSTRAINT chk_produtos_valores CHECK (preco >= 0 AND estoque_qtd >= 0 AND estoque_minimo >= 0),
  CONSTRAINT chk_produtos_dimensoes CHECK (peso_kg > 0 AND largura_cm > 0 AND altura_cm > 0 AND comprimento_cm > 0),
  CONSTRAINT chk_produtos_soft_delete CHECK (excluido_em IS NULL OR ativo = FALSE)
);

CREATE TABLE produto_imagens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  imagem_url VARCHAR(500) NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  INDEX idx_produto_imagens_ordem (produto_id, ordem)
);

CREATE TABLE produto_variacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  nome VARCHAR(120) NOT NULL,
  tamanho VARCHAR(20) NULL,
  estoque_qtd INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  excluido_em DATETIME NULL,
  atributos_json JSON NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_variacao_cor_tamanho (produto_id, nome, tamanho),
  UNIQUE KEY uq_variacoes_produto_id (produto_id, id),
  INDEX idx_variacoes_ativas (produto_id, ativo, excluido_em),
  CONSTRAINT chk_variacoes_estoque CHECK (estoque_qtd >= 0),
  CONSTRAINT chk_variacoes_soft_delete CHECK (excluido_em IS NULL OR ativo = FALSE)
);

CREATE TABLE movimentacoes_estoque (
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
  INDEX idx_movimentacoes_produto (produto_id, criado_em),
  CONSTRAINT chk_movimentacoes_quantidade CHECK (quantidade > 0 AND saldo_anterior >= 0 AND saldo_posterior >= 0)
);

CREATE TABLE favoritos (
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, produto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE avisos_estoque (
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  variacao_id INT NOT NULL DEFAULT 0,
  variacao_referencia_id INT GENERATED ALWAYS AS (NULLIF(variacao_id, 0)) STORED,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, produto_id, variacao_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  CONSTRAINT fk_avisos_variacao_produto FOREIGN KEY (produto_id, variacao_referencia_id) REFERENCES produto_variacoes(produto_id, id) ON DELETE CASCADE,
  INDEX idx_avisos_produto_variacao (produto_id, variacao_id)
);

CREATE TABLE avaliacoes (
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
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  INDEX idx_avaliacoes_produto_criado (produto_id, criado_em),
  CONSTRAINT chk_avaliacoes_nota CHECK (nota BETWEEN 1 AND 5)
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  idempotency_key VARCHAR(100) NULL,
  payment_status ENUM('pendente', 'pago', 'recusado', 'cancelado') NOT NULL DEFAULT 'pendente',
  reembolso_status VARCHAR(30) NULL,
  status_pedido ENUM('aguardando_pagamento', 'pago', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'reembolso_pendente', 'reembolsado') NOT NULL DEFAULT 'aguardando_pagamento',
  payment_id VARCHAR(150),
  estoque_reservado BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_entrega ENUM('envio', 'entrega_local') NOT NULL,
  endereco_entrega TEXT NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  codigo_rastreio VARCHAR(100),
  cep_entrega VARCHAR(8),
  frete_servico_id VARCHAR(30),
  prazo_entrega_dias INT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  frete DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  codigo_promocao VARCHAR(50),
  total DECIMAL(10,2) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE KEY uq_pedidos_usuario_idempotencia (usuario_id, idempotency_key),
  INDEX idx_pedidos_status (status_pedido, payment_status),
  INDEX idx_pedidos_usuario_criado (usuario_id, criado_em),
  INDEX idx_pedidos_payment_id (payment_id),
  INDEX idx_pedidos_criado (criado_em),
  CONSTRAINT chk_pedidos_valores CHECK (subtotal >= 0 AND frete >= 0 AND desconto >= 0 AND total >= 0 AND desconto <= subtotal + frete)
);

CREATE TABLE itens_pedido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  variacao_id INT NULL,
  variacao_nome VARCHAR(120) NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  CONSTRAINT fk_itens_variacao_produto FOREIGN KEY (produto_id, variacao_id) REFERENCES produto_variacoes(produto_id, id),
  INDEX idx_itens_produto_pedido (produto_id, pedido_id),
  CONSTRAINT chk_itens_pedido_valores CHECK (quantidade > 0 AND preco_unitario >= 0)
);

CREATE TABLE IF NOT EXISTS configuracoes_loja (
  id INT PRIMARY KEY,
  whatsapp VARCHAR(30) NOT NULL DEFAULT '',
  email_suporte VARCHAR(150) NOT NULL DEFAULT '',
  aviso_ativo TINYINT(1) NOT NULL DEFAULT 0,
  aviso_texto VARCHAR(255) NOT NULL DEFAULT '',
  politica_devolucao TEXT,
  banner_url VARCHAR(500) NOT NULL DEFAULT '',
  banner_titulo VARCHAR(150) NOT NULL DEFAULT '',
  banner_link VARCHAR(500) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo VARCHAR(50) NOT NULL,
  acao VARCHAR(100) NOT NULL,
  entidade_id INT,
  usuario_id INT,
  detalhes JSON,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_logs_tipo_entidade (tipo, entidade_id),
  INDEX idx_logs_criado_em (criado_em),
  INDEX idx_logs_usuario_criado (usuario_id, criado_em)
);

CREATE TABLE IF NOT EXISTS promocoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  tipo ENUM('percentual', 'fixo') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  inicio_em DATETIME NULL,
  fim_em DATETIME NULL,
  uso_maximo INT NULL,
  usos INT NOT NULL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_promocoes_validade (ativo, inicio_em, fim_em),
  CONSTRAINT chk_promocoes_valor CHECK (valor > 0 AND usos >= 0 AND (uso_maximo IS NULL OR (uso_maximo > 0 AND usos <= uso_maximo))),
  CONSTRAINT chk_promocoes_periodo CHECK (inicio_em IS NULL OR fim_em IS NULL OR fim_em >= inicio_em)
);

CREATE TABLE IF NOT EXISTS banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL DEFAULT '',
  imagem_url VARCHAR(500) NOT NULL,
  imagem_url_2 VARCHAR(500) NOT NULL DEFAULT '',
  link_url VARCHAR(500) NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  excluido_em DATETIME NULL,
  ordem INT NOT NULL DEFAULT 0,
  posicao_x TINYINT UNSIGNED NOT NULL DEFAULT 50,
  posicao_y TINYINT UNSIGNED NOT NULL DEFAULT 50,
  posicao_x_2 TINYINT UNSIGNED NOT NULL DEFAULT 50,
  posicao_y_2 TINYINT UNSIGNED NOT NULL DEFAULT 50,
  zoom TINYINT UNSIGNED NOT NULL DEFAULT 100,
  zoom_2 TINYINT UNSIGNED NOT NULL DEFAULT 100,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_banners_listagem (excluido_em, ativo, principal, ordem, criado_em),
  CONSTRAINT chk_banners_posicao CHECK (posicao_x BETWEEN 0 AND 100 AND posicao_y BETWEEN 0 AND 100 AND posicao_x_2 BETWEEN 0 AND 100 AND posicao_y_2 BETWEEN 0 AND 100),
  CONSTRAINT chk_banners_zoom CHECK (zoom BETWEEN 50 AND 150 AND zoom_2 BETWEEN 50 AND 150),
  CONSTRAINT chk_banners_soft_delete CHECK (excluido_em IS NULL OR (ativo = FALSE AND principal = FALSE))
);

CREATE TABLE IF NOT EXISTS webhook_eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evento_id VARCHAR(180) NOT NULL UNIQUE,
  tipo VARCHAR(80) NOT NULL,
  recebido_em DATETIME DEFAULT CURRENT_TIMESTAMP
);



