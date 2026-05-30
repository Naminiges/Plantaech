const supabase = require('../config/supabase');
const storage = require('../services/storage');

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
const normalizePhone = (p) => p ? p.replace(/[\s\-]/g, '') : null;

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
    if (phone && !PHONE_REGEX.test(normalizePhone(phone))) {
      return res.status(400).json({ error: 'Invalid phone number. Use 081x or +62 81x format' });
    }
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
    const objectKey = storage.buildObjectKey('avatars', req.file.originalname);
    const avatarUrl = await storage.uploadPublicImage(req.file, objectKey);
    const { data, error } = await supabase
      .from('users').update({ avatar: avatarUrl }).eq('id', req.user.id).select('id, avatar').single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/avatar
const removeAvatar = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('users').update({ avatar: null }).eq('id', req.user.id);
    if (error) throw error;
    res.json({ user: { avatar: null } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/profile
const deleteProfile = async (req, res, next) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Your account has been deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, removeAvatar, deleteProfile };
