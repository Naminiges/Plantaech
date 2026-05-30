const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { sendOtpEmail } = require('../services/emailService');

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
const normalizePhone = (p) => p ? p.replace(/[\s\-]/g, '') : null;

// Min 8 chars, at least 1 uppercase letter, at least 1 number
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });


// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'first_name, last_name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least 1 uppercase letter and 1 number' });
    }
    if (phone && !PHONE_REGEX.test(normalizePhone(phone))) {
      return res.status(400).json({ error: 'Invalid phone number. Use 081x or +62 81x format' });
    }

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ first_name, last_name, email, password: hashed, phone: phone || null })
      .select('id, first_name, last_name, email, phone, role, avatar, created_at')
      .single();

    if (error) throw error;
    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, password, role, avatar, is_banned')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ error: 'Account is banned' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    if (!PASSWORD_REGEX.test(new_password)) {
      return res.status(400).json({ error: 'Password must contain at least 1 uppercase letter and 1 number' });
    }

    const { data: user } = await supabase
      .from('users').select('password').eq('id', req.user.id).single();

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 12);
    await supabase.from('users').update({ password: hashed }).eq('id', req.user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password — OTP Flow ─────────────────────────────────────

// POST /api/auth/forgot-password  →  send OTP email
const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Always return generic message to prevent email enumeration
    const genericMsg = { message: 'If an account with that email exists, an OTP has been sent.' };

    // Check user exists and is not banned
    const { data: user } = await supabase
      .from('users')
      .select('id, is_banned')
      .eq('email', email)
      .single();

    if (!user || user.is_banned) return res.json(genericMsg);

    // Delete any existing OTP rows for this email (cleanup + prevent spam)
    await supabase.from('password_resets').delete().eq('email', email);

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    // Store hashed OTP with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertErr } = await supabase
      .from('password_resets')
      .insert({ email, otp_hash: otpHash, expires_at: expiresAt });

    if (insertErr) throw insertErr;

    // Send email via Resend
    await sendOtpEmail(email, otp);

    res.json(genericMsg);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp  →  verify OTP, return reset token
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    // Get the latest unexpired OTP for this email
    const { data: record, error } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Compare OTP
    const valid = await bcrypt.compare(otp, record.otp_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // Delete the OTP row (used, no longer needed)
    await supabase.from('password_resets').delete().eq('id', record.id);

    // Generate a short-lived reset token (10 minutes)
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ reset_token: resetToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password  →  set new password using reset token
const resetPassword = async (req, res, next) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
      return res.status(400).json({ error: 'reset_token and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!PASSWORD_REGEX.test(new_password)) {
      return res.status(400).json({ error: 'Password must contain at least 1 uppercase letter and 1 number' });
    }

    // Verify the reset token
    let payload;
    try {
      payload = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired reset token. Please request a new OTP.' });
    }

    if (payload.purpose !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Update the user's password
    const hashed = await bcrypt.hash(new_password, 12);
    const { error } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('email', payload.email);

    if (error) throw error;

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword, requestOtp, verifyOtp, resetPassword };
