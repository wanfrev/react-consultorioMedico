const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const PgHandler = require('./PgHandler');
const routes = require('./routes/routes'); // Importar el archivo de rutas
const Security = require('./Security');
const Session = require('./Session');

const app = express();
const port = process.env.PORT || 3000;

// Leer el archivo queries.json
const queries = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'queries.json'), 'utf8'));

// Leer el archivo config.json
const configPath = path.join(__dirname, 'json', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Configuración de la base de datos
const dbConfig = config.dbConfig;

// Crear instancia de PgHandler
const db = new PgHandler({ config: dbConfig, querys: queries });

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // body formulario

app.use(session({
  secret: config.sessionConfig.secret,
  resave: false, // Cambiar a false para evitar guardar la sesión si no ha sido modificada
  saveUninitialized: false, // Cambiar a false para evitar guardar sesiones no inicializadas
  cookie: {
    secure: false, // Asegúrate de que esté en false si no estás usando HTTPS
    maxAge: config.sessionConfig.cookie.maxAge // Asegúrate de que maxAge esté configurado correctamente
  }
}));

// Middleware para verificar la autenticación
const checkUserAuthentication = (req, res, next) => {
  if (req.session.userId && req.session.userProfile) {
    return next();
  } else {
    return res.status(401).send('Acceso denegado');
  }
};

// Middleware para pasar la instancia de la base de datos a las solicitudes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la página principal');
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.runQueryByKey({ key: 'login', params: [username, password] });
    if (result && result.length > 0) {
      const userId = result[0].user_id;
      const userProfile = result[0].profile_id;

      // Establecer la sesión del usuario
      req.session.userId = userId;
      req.session.userProfile = userProfile;

      // Guardar la sesión de forma explícita
      req.session.save(err => {
        if (err) console.error('Error al guardar la sesión:', err);
      });

      console.log("Sesión después del login:", req.session); // Agregar registro de la sesión
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Error en las credenciales. Intente de nuevo' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor. Intente nuevamente más tarde.' });
  }
});

// Ruta para registrar
app.post('/register', async (req, res) => {
  const { username, password, name, lastName, phone, email, address } = req.body;
  if (!username || !password || !name || !lastName || !phone || !email || !address) {
    return res.status(400).send(`{"msg": "datos invalidos..!"}`);
  }

  try {
    const existsResult = await db.exe('checkUserExists', [username]);
    if (existsResult.rows.length > 0) {
      return res.status(409).send(`{"msg": "usuario ya existente..!"}`);
    }

    const personResult = await db.exe('registerData', [name, lastName, phone, email, address]);
    if (personResult.rows.length > 0) {
      const personId = personResult.rows[0].person_id;

      const userResult = await db.exe('registerUser', [username, password, personId]);
      if (userResult.rows.length > 0) {
        return res.send(`{"msg": "usuario registrado con éxito..!"}`);
      } else {
        return res.status(400).send(`{"msg": "no se pudo registrar el usuario..!"}`);
      }
    } else {
      return res.status(400).send(`{"msg": "no se pudo registrar los datos personales..!"}`);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).send(`{"msg": "Error del servidor..!"}`);
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.send({ success: true });
  });
});

// Ruta para /toProcess
app.post('/toProcess', async (req, res) => {
  console.log("Sesión actual en /toProcess:", req.session);  // Verifica si el profileId está en la sesión
  
  if (!req.session.userProfile) {
    return res.status(401).send({ msg: "Debe iniciar sesión." });
  }

  const jsonData = {
    userProfile: req.session.userProfile,  // Esto debería estar en la sesión
    methodName: req.body.methodName,
    objectName: req.body.objectName,
    params: req.body.params
  };

  console.log("jsonData:", jsonData);  // Verifica si el perfil y los otros datos son correctos

  const security = new Security(req.db);

  try {
    const result = await security.invokeMethod(jsonData);
    return res.send({ msg: "Método ejecutado con éxito.", result });
  } catch (error) {
    return res.status(403).send({ msg: error.message });
  }
});

// Usar las rutas bajo el prefijo /api
app.use('/api', checkUserAuthentication, routes);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});