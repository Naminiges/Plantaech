const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Strict auth — rejects if no valid token
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_banned, avatar')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    if (user.is_banned) return res.status(403).json({ error: 'Account is banned' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block guests
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_banned, avatar')
      .eq('id', decoded.userId)
      .single();

    req.user = user && !user.is_banned ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { requireAuth, optionalAuth };
