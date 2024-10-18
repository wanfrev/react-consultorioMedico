const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const PgHandler = require('./PgHandler');

const app = express();

// Leer el archivo queries.json
const queries = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'queries.json'), 'utf8'));

// Leer el archivo config.json
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'config.json'), 'utf8'));

// Configuración de la base de datos
const dbConfig = config.dbConfig;

// Crear instancia de PgHandler
const db = new PgHandler({ config: dbConfig, querys: queries });

app.use(express.json());

app.use(session({
  secret: config.sessionConfig.secret,
  resave: config.sessionConfig.resave,
  saveUninitialized: config.sessionConfig.saveUninitialized,
  cookie: config.sessionConfig.cookie,
}));

// Middleware para verificar la autenticación
const checkUserAuthentication = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    return res.status(401).send('Acceso denegado');
  }
};

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la página principal');
});

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
    const result = await db.runQueryByKey({ key: 'login', params: [username, password] });
    if (result && result.length > 0) {
      req.session.userId = result[0].users_id;
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Error en las credenciales. Intente de nuevo' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor. Intente nuevamente más tarde.' });
  }
});

// Ruta protegida
app.get('/protected', checkUserAuthentication, (req, res) => {
  res.send('Acceso permitido');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
