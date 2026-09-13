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