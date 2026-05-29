const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

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

// POST /api/auth/forgot-password
// Repurposed: requires email + current password + new password
const forgotPassword = async (req, res, next) => {
  try {
    const { email, current_password, new_password } = req.body;
    if (!email || !current_password || !new_password) {
      return res.status(400).json({ error: 'email, current_password, and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    if (!PASSWORD_REGEX.test(new_password)) {
      return res.status(400).json({ error: 'Password must contain at least 1 uppercase letter and 1 number' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password, is_banned')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ error: 'Account is banned' });

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const hashed = await bcrypt.hash(new_password, 12);
    await supabase.from('users').update({ password: hashed }).eq('id', user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword, forgotPassword };
