CREATE DATABASE IF NOT EXISTS astroday
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE astroday;

CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data_imagem DATE NOT NULL,
  explicacao TEXT,
  url TEXT NOT NULL,
  hdurl TEXT NULL,
  media_type VARCHAR(50),
  copyright VARCHAR(255) NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
