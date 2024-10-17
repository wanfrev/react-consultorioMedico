const express = require('express');
const path = require('path');
const session = require('express-session');
const Db = require('./Db');

const app = express();
const db = new Db();

app.use(express.json());

app.use(session({
  secret: 'qazwsxedcrfv10293847_thor',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000,
    secure: false,
    sameSite: true,
  },
}));

// Middleware para verificar la autenticación
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    return res.status(401).send('Acceso denegado');
  }
};

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.send({ success: true });
  });
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.execute('SELECT * FROM "users" WHERE username = $1 AND password = $2', [username, password]);
    if (result && result.rows.length > 0) {
      req.session.userId = result.rows[0].user_id; // Asegúrate de que el nombre de la columna sea correcto
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Error al iniciar sesión. Intente de nuevo' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor. Intente nuevamente más tarde.' });
  }
});

// Ruta protegida
app.get('/protected', isAuthenticated, (req, res) => {
  res.send('Acceso permitido');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});