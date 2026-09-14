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
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  payment_status ENUM('pendente', 'pago', 'recusado', 'cancelado') NOT NULL DEFAULT 'pendente',
  payment_id VARCHAR(150),
  tipo_entrega ENUM('envio', 'entrega_local') NOT NULL,
  endereco_entrega TEXT NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  codigo_rastreio VARCHAR(100),
  total DECIMAL(10,2) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
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
  frete_fixo DECIMAL(10,2) NOT NULL DEFAULT 0,
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
USE nkg_importados;


