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
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
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
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  idempotency_key VARCHAR(100) NULL,
  payment_status ENUM('pendente', 'pago', 'recusado', 'cancelado') NOT NULL DEFAULT 'pendente',
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
  INDEX idx_pedidos_status (status_pedido, payment_status)
);

CREATE TABLE itens_pedido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
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
  INDEX idx_logs_tipo_entidade (tipo, entidade_id),
  INDEX idx_logs_criado_em (criado_em)
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
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evento_id VARCHAR(180) NOT NULL UNIQUE,
  tipo VARCHAR(80) NOT NULL,
  recebido_em DATETIME DEFAULT CURRENT_TIMESTAMP
);



