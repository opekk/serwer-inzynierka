import nodemailer from 'nodemailer';

// ============================================
// EMAIL CONFIGURATION
// ============================================

const createTransporter = () => {
  // For development: use Ethereal (fake SMTP) or Mailtrap
  // For production: use real SMTP service (Gmail, SendGrid, etc.)

  if (process.env.NODE_ENV === 'production') {
    // Production: Use real SMTP service
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development: Use Mailtrap or console logging
    // If no EMAIL_HOST is set, just log to console
    if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST === 'smtp.mailtrap.io') {
      console.log('⚠️  Email sending disabled in development. Using console logging.');
      return null; // We'll handle this case in sendEmail
    }

    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// ============================================
// EMAIL SENDING FUNCTION
// ============================================

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // If no transporter (development mode), just log and return success
    if (!transporter) {
      console.log('\n📧 ===== EMAIL (Development Mode) =====');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
      if (options.html) {
        console.log('HTML:', options.html);
      }
      console.log('=====================================\n');
      return { success: true, messageId: 'dev-mode-no-email' };
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'AuctionHub'} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// ============================================
// EMAIL TEMPLATES
// ============================================

export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const message = `
    Witaj ${user.username}!

    Dziękujemy za rejestrację w AuctionHub.

    Aby zweryfikować swój adres email, kliknij w poniższy link:
    ${verificationUrl}

    Link jest ważny przez 24 godziny.

    Jeśli nie rejestrowałeś się w AuctionHub, zignoruj tę wiadomość.

    Pozdrawiamy,
    Zespół AuctionHub
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #0ea5e9;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Witaj w AuctionHub!</h1>
        </div>
        <div class="content">
          <p>Cześć <strong>${user.username}</strong>!</p>

          <p>Dziękujemy za rejestrację w AuctionHub - platformie aukcyjnej, która łączy kupujących i sprzedających z całego świata.</p>

          <p>Aby aktywować swoje konto i móc w pełni korzystać z naszych usług, kliknij przycisk poniżej:</p>

          <center>
            <a href="${verificationUrl}" class="button">Zweryfikuj adres email</a>
          </center>

          <p>Lub skopiuj i wklej ten link do przeglądarki:</p>
          <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${verificationUrl}
          </p>

          <div class="footer">
            <p><strong>⚠️ Ważne informacje:</strong></p>
            <ul>
              <li>Link jest ważny przez 24 godziny</li>
              <li>Jeśli nie rejestrowałeś się w AuctionHub, zignoruj tę wiadomość</li>
              <li>Nigdy nie udostępniaj tego linku innym osobom</li>
            </ul>

            <p>Pozdrawiamy,<br>
            <strong>Zespół AuctionHub</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Weryfikacja adresu email - AuctionHub',
    message,
    html
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    Witaj ${user.username}!

    Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.

    Aby zresetować hasło, kliknij w poniższy link:
    ${resetUrl}

    Link jest ważny przez 10 minut.

    Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.

    Pozdrawiamy,
    Zespół AuctionHub
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #ef4444;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .warning {
          background: #fef3c7;
          padding: 15px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset hasła</h1>
        </div>
        <div class="content">
          <p>Cześć <strong>${user.username}</strong>!</p>

          <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w AuctionHub.</p>

          <p>Aby ustawić nowe hasło, kliknij przycisk poniżej:</p>

          <center>
            <a href="${resetUrl}" class="button">Zresetuj hasło</a>
          </center>

          <p>Lub skopiuj i wklej ten link do przeglądarki:</p>
          <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>

          <div class="warning">
            <p><strong>⚠️ Uwaga bezpieczeństwa:</strong></p>
            <p>Jeśli nie prosiłeś o reset hasła, natychmiast zmień hasło do swojego konta i skontaktuj się z naszym zespołem wsparcia.</p>
          </div>

          <div class="footer">
            <p><strong>Ważne informacje:</strong></p>
            <ul>
              <li>Link jest ważny tylko przez 10 minut</li>
              <li>Po użyciu linku nie będzie on już działał</li>
              <li>Nigdy nie udostępniaj tego linku innym osobom</li>
            </ul>

            <p>Pozdrawiamy,<br>
            <strong>Zespół AuctionHub</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Reset hasła - AuctionHub',
    message,
    html
  });
};

export const sendWelcomeEmail = async (user) => {
  const message = `
    Witaj ${user.username}!

    Twoje konto zostało pomyślnie zweryfikowane!

    Możesz teraz w pełni korzystać z AuctionHub:
    - Przeglądaj aukcje
    - Licytuj przedmioty
    - Twórz własne aukcje
    - Zarządzaj swoim profilem

    Życzymy udanych transakcji!

    Pozdrawiamy,
    Zespół AuctionHub
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .features {
          background: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .feature-item {
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .feature-item:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Konto aktywowane!</h1>
        </div>
        <div class="content">
          <p>Cześć <strong>${user.username}</strong>!</p>

          <p>Gratulacje! Twoje konto zostało pomyślnie zweryfikowane i jest już w pełni aktywne.</p>

          <div class="features">
            <h3>Co możesz teraz robić?</h3>
            <div class="feature-item">📦 Przeglądaj tysiące aukcji</div>
            <div class="feature-item">💰 Licytuj przedmioty</div>
            <div class="feature-item">🏪 Twórz własne aukcje</div>
            <div class="feature-item">⭐ Zbieraj opinie i buduj reputację</div>
            <div class="feature-item">👤 Zarządzaj swoim profilem</div>
          </div>

          <center>
            <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Przejdź do AuctionHub
            </a>
          </center>

          <p style="margin-top: 30px; color: #6b7280;">
            Życzymy udanych transakcji!<br>
            <strong>Zespół AuctionHub</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Witaj w AuctionHub! 🎉',
    message,
    html
  });
};
