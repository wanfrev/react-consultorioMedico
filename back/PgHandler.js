const { Pool } = require('pg');
const config = require('../back/json/config.json');

class PgHandler {
  constructor({ querys }) {
    this.querys = querys;
    this.pool = new Pool(config.dbConfig);
  }

  async executeQuery({ key, params = [] }) {
    let client;
    try {
      const query = this.querys[key];
      client = await this.pool.connect();
      const { rows } = await client.query(query, params);
      return rows;
    } catch (error) {
      console.error('Database error:', error.message);
      return { error };
    } finally {
      if (client) client.release();
    }
  }

  async connect() {
    try {
      return await this.pool.connect();
    } catch (error) {
      console.error('Database connection error:', error.message);
      return { error };
    }
  }

  async release() {
    try {
      await this.pool.end();
    } catch (error) {
      console.error('Error releasing pool:', error.message);
      return { error };
    }
  }

  async transaction({ querys = [] }) {
    const client = await this.connect();
    try {
      await client.query("BEGIN");
      for (const elemento of querys) {
        const { key, params } = elemento;
        await client.query(this.querys[key], params);
      }
      const result = await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('Transaction error:', error.message);
      return { error };
    } finally {
      client.release();
    }
  }
}

module.exports = PgHandler;