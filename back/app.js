const express = require('express');
const session = require('express-session');
const PgHandler = require('./PgHandler');
const dbConfig = require('./dbConfig');
const queries = require('./queries.json');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const app = express();
const db = new PgHandler({ config: dbConfig, querys: queries });

// Configuración de la sesión
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar autenticación del usuario
function checkUserAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Definir rutas

// Página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta protegida
app.get('/dashboard', checkUserAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.runQuery(queries.login, [email, password]);
        if (user.rows.length > 0) {
            req.session.user = user.rows[0];
            res.redirect('/dashboard');
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Ruta para enviar el correo de recuperación de contraseña
app.post('/recover-password', async (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');

    try {
        // Verificar si el usuario existe
        const user = await db.runQuery(queries.findUserByEmail, [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Correo electrónico no encontrado.' });
        }

        // Actualizar la base de datos con el token de recuperación
        await db.runQuery(queries.updateResetToken, [token, Date.now() + 3600000, email]);

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'tuemail@gmail.com',
                pass: 'tucontraseña',
            },
        });

        // Configurar los detalles del correo
        const mailOptions = {
            to: email,
            from: 'tuemail@gmail.com',
            subject: 'Recuperación de contraseña',
            text: `Has solicitado restablecer tu contraseña.\n\n
                   Haz clic en el siguiente enlace para continuar:\n\n
                   http://${req.headers.host}/reset-password/${token}\n\n
                   Si no solicitaste esto, ignora este correo.`,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Correo de recuperación enviado.' });
    } catch (error) {
        console.error('Error en la recuperación de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para restablecer la contraseña
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verificar si el token es válido y no ha expirado
        const user = await db.runQuery(queries.findUserByResetToken, [token, Date.now()]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

        // Actualizar la contraseña en la base de datos
        await db.runQuery(queries.updatePassword, [hashedPassword, token]);

        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
