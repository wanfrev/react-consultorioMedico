const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('./Db'); // Asegúrate de importar tu clase Db

class PassRecovery {
  static async sendRecoveryEmail(email, host) {
    const token = crypto.randomBytes(20).toString('hex');

    try {
      const result = await db.runQuery('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        throw new Error('Correo electrónico no encontrado.');
      }

      await db.runQuery('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3', [
        token,
        Date.now() + 3600000, // 1 hora
        email,
      ]);

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'tuemail@gmail.com',
          pass: 'tucontraseña',
        },
      });

      const mailOptions = {
        to: email,
        from: 'tuemail@gmail.com',
        subject: 'Recuperación de contraseña',
        text: `Has recibido este correo porque tú (o alguien más) ha solicitado restablecer la contraseña de tu cuenta.\n\n
        Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso:\n\n
        http://${host}/reset-password/${token}\n\n
        Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.\n`,
      };

      await transporter.sendMail(mailOptions);
      return 'Correo de recuperación enviado.';
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw new Error('Error interno del servidor.');
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const result = await db.runQuery('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2', [
        token,
        Date.now(),
      ]);

      if (result.rows.length === 0) {
        throw new Error('El token de restablecimiento de contraseña es inválido o ha expirado.');
      }

      const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
      await db.runQuery('UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = $2', [
        hashedPassword,
        token,
      ]);

      return 'Contraseña restablecida con éxito.';
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      throw new Error('Error interno del servidor.');
    }
  }
}

module.exports = PassRecovery;