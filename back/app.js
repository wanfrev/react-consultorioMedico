// Importar módulos necesarios
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const Db = require('./Db');

// Crear la aplicación Express y configurar la base de datos
const app = express();
const db = new Db();

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Parsear JSON en las peticiones

// Configuración de la sesión
app.use(
  session({
    secret: 'qwertypoiuy123_flex', // Cambiar este secreto en producción
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1800000, // Expiración de 30 minutos
      secure: false, // Cambiar a true si usas HTTPS
      sameSite: 'strict', // Proteger contra ataques CSRF
    },
  })
);

// Rutas

// Ruta para el archivo de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta para manejar el login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.exe('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

    if (result && result.rows.length > 0) {
      req.session.userId = result.rows[0].id;
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Datos inválidos, no se puede hacer login..!' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor. Intente nuevamente más tarde.' });
  }
});

// Ruta protegida de ejemplo
app.get('/protected', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ message: 'Acceso permitido' });
  }
  res.status(403).json({ message: 'Acceso denegado' });
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // Eliminar la cookie de sesión en el cliente
    res.json({ success: true });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
