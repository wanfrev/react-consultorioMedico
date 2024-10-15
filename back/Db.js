const Db = class {
  constructor() {
    const { Pool } = require("pg");
    this.pool = new Pool({
      database: "consultorio",
      user: "postgres",
      password: "30200228",
      port: 5432,
      ssl: false,
      max: 20, // set pool max size to 20
      idleTimeoutMillis: 1000, // close idle clients after 1 second
      connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
      maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
    });
  }

  async exe(sentencia, params) {
    try {
      let client = await this.pool.connect();
      let res = await client.query(sentencia, params);
      client.release();
      return res;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};

module.exports = Db;
