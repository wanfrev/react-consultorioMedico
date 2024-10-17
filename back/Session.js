const expressSession = require('express-session');
const PgSession = require('connect-pg-simple')(expressSession);

class Session {
  constructor(app, db) {
    this.db = db;
    this.setupSession(app);
  }

  setupSession(app) {
    app.use(
      expressSession({
        store: new PgSession({
          pool: this.db.pool,
          tableName: 'session',
        }),
        secret: 'qazwsxedcrfv10293847_thor',
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 1800000,
          secure: false,
          sameSite: true,
        },
      })
    );
  }

  sessionExists(req) {
    return req.session && req.session.userId ? true : false;
  }

  async createSession(req, res) {
    const { username, password } = req.body;
    try {
      const query = `
        SELECT u.users_id, u.users_na, p.profile_id 
        FROM security.users u
        INNER JOIN security.profile p ON p.profile_id = u.profile_id 
        WHERE u.users_na = $1 AND u.users_cl = $2
      `;
      const result = await this.db.execute(query, [username, password]);
      if (result.rows.length > 0) {
        req.session.userId = result.rows[0].users_id;
        req.session.userName = result.rows[0].users_na;
        req.session.userProfile = result.rows[0].profile_id;
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