const { Pool } = require('pg');
const config = require('../back/json/config.json'); // Cargar la configuración desde el archivo JSON

class PgHandler {
  constructor({ querys }) {
    this.querys = querys; // Almacenar las consultas
    this.pool = new Pool(config.dbConfig); // Crear un pool de conexiones con la configuración de la base de datos
  }

  // Ejecutar una consulta
  async executeQuery({ key, params = [] }) {
    let client;
    try {
      const query = this.querys[key]; // Obtener la consulta por clave
      client = await this.pool.connect(); // Conectar al cliente
      const { rows } = await client.query(query, params); // Ejecutar la consulta con los parámetros
      return rows; // Devolver las filas resultantes
    } catch (error) {
      console.error('Database error:', error.message); // Manejar errores de la base de datos
      return { error };
    } finally {
      if (client) client.release(); // Liberar el cliente
    }
  }

  // Conectar al pool de conexiones
  async connect() {
    try {
      return await this.pool.connect(); // Devolver la conexión del cliente
    } catch (error) {
      console.error('Database connection error:', error.message); // Manejar errores de conexión
      return { error };
    }
  }

  // Liberar el pool de conexiones
  async release() {
    try {
      await this.pool.end(); // Terminar todas las conexiones en el pool
    } catch (error) {
      console.error('Error releasing pool:', error.message); // Manejar errores al liberar el pool
      return { error };
    }
  }

  // Ejecutar una transacción
  async transaction({ querys = [] }) {
    const client = await this.connect(); // Conectar al cliente
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

module.exports = PgHandler; // Exportar la clase PgHandler