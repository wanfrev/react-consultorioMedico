const expressSession = require('express-session');
const PgSession = require('connect-pg-simple')(expressSession);
const path = require('path');
const fs = require('fs');

// Leer el archivo config.json
const configPath = path.join(__dirname, 'json', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

class Session {
  constructor(app, db) {
    this.db = db;
    this.configureSession(app);
  }

  configureSession(app) {
    app.use(
      expressSession({
        ...config.sessionConfig,
        store: new PgSession({
          pool: this.db.pool,
          tableName: 'session',
        }),
      })
    );
  }

  isSessionActive(req) {
    return req.session && req.session.userId ? true : false;
  }

  async initializeUserSession(req, res) {
    const { username, password } = req.body;
    try {
      const result = await this.db.runQueryByKey({ key: 'login', params: [username, password] });
      if (result.length > 0) {
        req.session.userId = result[0].users_id;
        req.session.userName = result[0].users_na;
        req.session.userProfile = result[0].profile_id;
        res.send('Sesión creada con éxito.');
      } else {
        res.status(401).send('Datos inválidos, no se puede iniciar sesión.');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).send('Error interno del servidor.');
    }
  }
}

module.exports = Session;
