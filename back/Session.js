const Session = class {
  constructor(app, db) {
    this.session = require("express-session");
    const PgSession = require("connect-pg-simple")(this.session);

    app.use(
      this.session({
        store: new PgSession({
          pool: db.pool, // Usa la pool de conexiones de tu clase Db
          tableName: 'session' // Nombre de la tabla para almacenar las sesiones
        }),
        secret: "qwertypoiuy123_flex",
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 1800000, // 30 minutos
          secure: false,
          sameSite: true,
        },
      })
    );
  }

  autenticar(req) {}

  sessionExist(req) {
    if (req.session) {
      if (req.session.userId) {
        return true;
      } else return false;
    } else return false;
  }

  createSession(req, res) {
    db.exe(
      `select u.user_id, u.user_na, p.profile_id from security.user u
      inner join security.profile p on p.profile_id = u.profile_id 
      where u.user_na = $1 and u.user_cl = $2
      `,
      [req.body.username, req.body.password]
    ).then((r) => {
      if (r.rows.length > 0) {
        req.session.userId = r.rows[0].user_id;
        req.session.userName = r.rows[0].user_na;
        req.session.userProfile = r.rows[0].profile_id;
        res.send("sesion creada..!");
      } else {
        res.send("Datos invalidos, no se puede hacer login..!");
      }
    });
  }
};

module.exports = Session;