const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const databaseName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'astroday';

const databaseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

async function connectDatabase() {
  pool = mysql.createPool(databaseConfig);
  await pool.query('SELECT 1 FROM favoritos LIMIT 1');
}

function getPool() {
  if (!pool) {
    throw new Error('Banco de dados ainda nao foi conectado.');
  }

  return pool;
}

module.exports = {
  connectDatabase,
  getPool
};
