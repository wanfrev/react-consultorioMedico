const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const Db = require('./Db');

const app = express();
const db = new Db();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'qwertypoiuy123_flex',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000,
    secure: false,
    sameSite: true,
  },
}));

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.send({ success: true });
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.execute('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result && result.rows.length > 0) {
      req.session.userId = result.rows[0].id;
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Error al inicia sesion. Intente de nuevo' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor. Intente nuevamente más tarde.' });
  }
});

app.get('/protected', (req, res) => {
  if (req.session.userId) {
    res.send('Acceso permitido');
  } else {
    res.send('Acceso denegado');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});