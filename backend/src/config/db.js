const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function inicializarPool() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      // 🔥 CLAVE PARA AWS (esto soluciona tu error)
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Probar la conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión al Pool de AWS MariaDB establecida con éxito.');
    connection.release();

  } catch (err) {
    console.error('❌ Error fatal al iniciar el pool de AWS MariaDB:', err.message);
    process.exit(1);
  }
}

// Función helper
async function execute(sql, params = []) {
  if (!pool) throw new Error("La base de datos AWS no está conectada");

  try {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  } catch (err) {
    console.error('❌ Error ejecutando la consulta SQL:', err.message);
    throw err;
  }
}

module.exports = {
  inicializarPool,
  execute
};