const expressSession = require('express-session');
const PgSession = require('connect-pg-simple')(expressSession);

class Session {
  constructor(app, db) {
    this.db = db;
    app.use(
      expressSession({
        store: new PgSession({
          pool: this.db.pool,
          tableName: 'session',
        }),
        secret: 'qwertypoiuy123_flex',
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
    try {
      const query = `
        SELECT u.user_id, u.user_na, p.profile_id 
        FROM security.user u
        INNER JOIN security.profile p ON p.profile_id = u.profile_id 
        WHERE u.user_na = $1 AND u.user_cl = $2
      `;
      const result = await this.db.execute(query, [req.body.username, req.body.password]);
      if (result.rows.length > 0) {
        req.session.userId = result.rows[0].user_id;
        req.session.userName = result.rows[0].user_na;
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