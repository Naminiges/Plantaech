const nodemailer = require('nodemailer');

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
 * Send an OTP email.
 * @param {string} to      – recipient email
 * @param {string} otp     – 6-digit OTP string
 * @param {'registration'|'password-reset'} purpose
 */
const sendOtpEmail = async (to, otp, purpose = 'password-reset') => {
  const content = EMAIL_CONTENT[purpose] || EMAIL_CONTENT['password-reset'];

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('\n' + '='.repeat(60));
    console.warn('⚠️  GMAIL SMTP NOT CONFIGURED');
    console.warn('Please add SMTP_USER and SMTP_PASS to your server/.env file.');
    console.warn(`Recipient: ${to}`);
    console.warn(`Purpose:   ${purpose}`);
    console.warn(`OTP CODE:  ${otp}`);
    console.warn('='.repeat(60) + '\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"Plantaech" <${smtpUser}>`,
    to,
    subject: content.subject,
    html: `
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
</html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('SMTP email error:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOtpEmail };
