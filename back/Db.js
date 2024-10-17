const { Pool } = require('pg');
const config = require('./config.json');

class Db {
  constructor() {
    this.pool = new Pool(config.dbConfig);
  }

  async execute(query, params) {
    let client;
    try {
      client = await this.pool.connect();
      return await client.query(query, params);
    } catch (error) {
      console.error('Database error:', error.message);
      return null;
    } finally {
      if (client) client.release();
    }
  }
}

module.exports = Db;