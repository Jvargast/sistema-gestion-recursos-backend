import nodemailer from "nodemailer";

//Ver archivo .env

class EmailService {
  /**
   * Enviar un correo electrónico con la contraseña generada.
   * @param {string} email - Dirección de correo del usuario.
   * @param {string} tempPassword - Contraseña temporal generada.
   */
  async sendPasswordEmail(email, tempPassword) {
    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER, // Usuario del SMTP
        pass: process.env.SMTP_PASS, // Contraseña del SMTP
      },
      //debug: true, // Activa logs de depuración
      //logger: true, // Activa logs detallados
    });
    const dominio = "https://www.aguasvalentino.com/login"
    // Configurar el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Dirección del remitente
      to: email,
      subject: "Tu contraseña temporal",
      text: `Hola,\n\nTu cuenta ha sido creada exitosamente. Tu contraseña temporal es: ${tempPassword}\n\nPor favor, inicia sesión en ${dominio} y cambia tu contraseña.\n\nSaludos,\nEl Equipo de TI`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
