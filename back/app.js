const express = require('express');
const path = require('path');
const session = require('express-session');
const Db = require('./Db');

const app = express();
const db = new Db();

app.use(express.json()); // Para poder parsear JSON en las peticiones

// Configuración de sesión
app.use(session({
  secret: 'qwertypoiuy123_flex',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1800000, // 30 minutos
    secure: false,
    sameSite: true,
  },
}));

// Servir el archivo HTML para el login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Servir el archivo HTML para la página de inicio
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'inicio.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await db.exe('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

  if (result && result.rows.length > 0) {
    req.session.userId = result.rows[0].id;
    res.redirect('/inicio'); // Redirigir a la página de inicio después del login
  } else {
    res.status(401).send('Datos inválidos, no se puede hacer login..!');
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