const supabase = require('../config/supabase');
const path = require('path');

// GET /api/users/profile
const getProfile = async (req, res) => {
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, phone, avatar, role, created_at')
    .eq('id', req.user.id).single();
  res.json({ user: data });
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({ first_name, last_name, phone })
      .eq('id', req.user.id)
      .select('id, first_name, last_name, email, phone, avatar, role')
      .single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/avatar
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Avatar image is required' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const { data, error } = await supabase
      .from('users').update({ avatar: avatarUrl }).eq('id', req.user.id).select('id, avatar').single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, updateAvatar };
