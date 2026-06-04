const EMAIL_CONTENT = {
  registration: {
    subject: 'Verify Your Email — Plantaech',
    heading: 'Email Verification Code',
    body: 'Complete your registration by entering the verification code below in the app.',
  },
  'password-reset': {
    subject: 'Your Password Reset Code — Plantaech',
    heading: 'Password Reset Code',
    body: 'We received a request to reset your password. Enter the verification code below in the app to continue.',
  },
};

/**
 * Send an OTP email using Brevo (Sendinblue) HTTPS API.
 * This bypasses Railway's SMTP block.
 * @param {string} to      – recipient email
 * @param {string} otp     – 6-digit OTP string
 * @param {'registration'|'password-reset'} purpose
 */
const sendOtpEmail = async (to, otp, purpose = 'password-reset') => {
  const content = EMAIL_CONTENT[purpose] || EMAIL_CONTENT['password-reset'];

  const brevoApiKey = process.env.BREVO_API_KEY;
  const smtpUser = process.env.SMTP_USER; // Used as the sender email

  if (!brevoApiKey || !smtpUser) {
    console.warn('\n' + '='.repeat(60));
    console.warn('⚠️  BREVO API KEY NOT CONFIGURED');
    console.warn('Please add BREVO_API_KEY and SMTP_USER to your server/.env file (and Railway).');
    console.warn(`Recipient: ${to}`);
    console.warn(`Purpose:   ${purpose}`);
    console.warn(`OTP CODE:  ${otp}`);
    console.warn('='.repeat(60) + '\n');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#15803d,#22c55e);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🌿 Plantaech</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Diagnostic Precision for Agriculture</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">${content.heading}</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
              ${content.body}
            </p>
            <!-- OTP box -->
            <div style="background:#f9fafb;border:2px dashed #d1d5db;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#15803d;font-family:'Courier New',monospace;">${otp}</span>
            </div>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">⏱ This code expires in <strong>5 minutes</strong>.</p>
            <p style="margin:0;color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Plantaech — AI-Powered Plant Disease Diagnosis</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Plantaech',
          email: smtpUser
        },
        to: [
          {
            email: to
          }
        ],
        subject: content.subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API error:', errorData);
      throw new Error(`Failed to send OTP email: ${response.statusText}`);
    }

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send a contact form email using Brevo (Sendinblue) HTTPS API.
 * @param {string} name      – sender name
 * @param {string} email     – sender email
 * @param {string} subject   – subject
 * @param {string} message   – message content
 */
const sendContactEmail = async (name, email, subject, message) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const smtpUser = process.env.SMTP_USER; // Used as the recipient

  if (!brevoApiKey || !smtpUser) {
    console.warn('⚠️ BREVO API KEY NOT CONFIGURED for Contact Form');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:40px;">
  <div style="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
    <h2 style="color:#111827;margin-top:0;">New Contact Request 🌿</h2>
    <p style="color:#6b7280;margin-bottom:20px;">You received a new message from the Plantaech contact form.</p>
    
    <div style="background:#f3f4f6;padding:20px;border-radius:12px;margin-bottom:24px;">
      <p style="margin:0 0 8px;"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0 0 8px;"><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <div style="border-left:4px solid #15803d;padding-left:16px;color:#111827;line-height:1.6;">
      ${message.replace(/\n/g, '<br/>')}
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: name,
          email: email
        },
        to: [
          {
            email: smtpUser
          }
        ],
        subject: `[Plantaech Contact] ${subject}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Contact error:', errorData);
      throw new Error(`Failed to send Contact email: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Contact email sending error:', error);
    throw new Error('Failed to send Contact email');
  }
};

module.exports = { sendOtpEmail, sendContactEmail };
