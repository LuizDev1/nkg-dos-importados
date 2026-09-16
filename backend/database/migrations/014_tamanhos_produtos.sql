ALTER TABLE produtos ADD COLUMN tamanhos_json JSON NULL;
ALTER TABLE produto_variacoes ADD COLUMN tamanho VARCHAR(2) NOT NULL DEFAULT '';
