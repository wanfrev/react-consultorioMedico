const { Pool } = require("pg");

class Db {
  constructor() {
    this.pool = new Pool({
      database: "consultorio",
      user: "postgres",
      password: "30200228",
      host: "localhost", // Asegúrate de que el host esté configurado correctamente
      port: 5432,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 1000,
      maxUses: 7500,
    });
  }

  async execute(query, params) {
    let client;
    try {
      client = await this.pool.connect();
      const result = await client.query(query, params);
      return result;
    } catch (error) {
      console.error("Database error:", error.message);
      return null;
    } finally {
      if (client) client.release();
    }
  }
}

module.exports = Db;