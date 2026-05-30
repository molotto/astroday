const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const databaseName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'astroday';

const databaseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

function validarNomeBanco(nome) {
  if (!/^[a-zA-Z0-9_]+$/.test(nome)) {
    throw new Error('Nome do banco de dados invalido. Use apenas letras, numeros e underline.');
  }
}

async function initDatabase() {
  validarNomeBanco(databaseName);

  const connection = await mysql.createConnection(databaseConfig);

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci`
  );

  await connection.end();

  pool = mysql.createPool({
    ...databaseConfig,
    database: databaseName
  });

  await pool.execute(`
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
    )
  `);
}

function getPool() {
  if (!pool) {
    throw new Error('Banco de dados ainda nao foi inicializado.');
  }

  return pool;
}

module.exports = {
  initDatabase,
  getPool
};
