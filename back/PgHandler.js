const { Pool } = require('pg');
const config = require('./json/config.json');

class PgHandler {
  constructor({ querys }) {
    this.querys = querys;
    this.pool = new Pool(config.dbConfig); // Crear un pool de conexiones con la configuración de la base de datos
  }

  async runQueryByKey({ key, params = [] }) {
    let client;
    try {
      const query = this.querys[key]; // Obtener la consulta por clave
      client = await this.pool.connect(); // Conectar al cliente
      const { rows } = await client.query(query, params); // Ejecutar la consulta con los parámetros
      return rows; // Devolver las filas resultantes
    } catch (error) {
      console.error('Database error:', error.message);
      return { error };
    } finally {
      if (client) client.release(); // Liberar el cliente
    }
  }

  // Conectar al pool de conexiones
  async openDatabaseConnection() {
    try {
      return await this.pool.connect(); // Devolver la conexión del cliente
    } catch (error) {
      console.error('Database connection error:', error.message);
      return { error };
    }
  }

  // Liberar el pool de conexiones
  async closeConnectionPool() {
    try {
      await this.pool.end(); // Terminar todas las conexiones en el pool
    } catch (error) {
      console.error('Error releasing pool:', error.message);
      return { error };
    }
  }

  // Ejecutar una transacción
  async executeTransaction({ querys = [] }) {
    const client = await this.openDatabaseConnection(); // Conectar al cliente
    try {
      await client.query("BEGIN"); // Iniciar la transacción
      for (const elemento of querys) {
        const { key, params } = elemento;
        await client.query(this.querys[key], params); // Ejecutar cada consulta en la transacción
      }
      const result = await client.query("COMMIT"); // Confirmar la transacción
      return result; // Devolver el resultado
    } catch (error) {
      await client.query("ROLLBACK"); // Revertir la transacción en caso de error
      console.error('Transaction error:', error.message); // Manejar errores de la transacción
      return { error };
    } finally {
      client.release(); // Liberar el cliente
    }
  }
}

module.exports = PgHandler;
