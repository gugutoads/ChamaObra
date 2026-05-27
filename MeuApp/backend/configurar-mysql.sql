-- Script para configurar acesso remoto ao MySQL
-- Execute este script no seu cliente MySQL (MySQL Workbench, phpMyAdmin, etc)

-- Permite conexões de qualquer host para o usuário root
GRANT ALL PRIVILEGES ON chamaobrá.* TO 'root'@'%' IDENTIFIED BY 'Kauy@05';

-- Aplica as alterações
FLUSH PRIVILEGES;

-- Verifica se funcionou
SELECT user, host FROM mysql.user WHERE user = 'root';