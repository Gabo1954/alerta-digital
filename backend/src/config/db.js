const oracledb = require('oracledb');
require('dotenv').config();

// Formatear las respuestas de Oracle como Objetos JSON
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Auto-commit para que los INSERT y UPDATE se guarden de inmediato
oracledb.autoCommit = true; 

async function inicializarPool() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      walletLocation: process.env.TNS_ADMIN,
      // 👇 ESTA LÍNEA ABRE EL CANDADO DE LA WALLET 👇
      walletPassword: process.env.WALLET_PASSWORD, 
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });
    console.log(' La Conexión al Pool de Oracle Database establecida con éxito.');
  } catch (err) {
    console.error('❌ Error fatal al iniciar el pool de Oracle:', err.message);
    process.exit(1); 
  }
}

// Función de ayuda para hacer consultas fácilmente
async function execute(sql, binds = [], opts = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close(); // Siempre liberar la conexión de vuelta al pool
      } catch (err) {
        console.error('Error cerrando la conexión:', err);
      }
    }
  }
}

module.exports = {
  inicializarPool,
  execute
};