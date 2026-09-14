USE nkg_importados;

ALTER TABLE usuarios
  ADD COLUMN status ENUM('ativo', 'bloqueado') NOT NULL DEFAULT 'ativo';
