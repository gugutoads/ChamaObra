-- Adicionar colunas para detalhamento de endereço e tipo de imóvel
ALTER TABLE servicos ADD COLUMN cep VARCHAR(20);
ALTER TABLE servicos ADD COLUMN numero VARCHAR(20);
ALTER TABLE servicos ADD COLUMN complemento VARCHAR(100);
ALTER TABLE servicos ADD COLUMN tipoImovel VARCHAR(50);
