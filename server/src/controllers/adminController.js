const supabase = require('../config/supabase');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [users, diagnoses, threads, pendingReports] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('diagnoses').select('id', { count: 'exact', head: true }),
      supabase.from('threads').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    res.json({
      totalUsers: users.count || 0,
      totalDiagnoses: diagnoses.count || 0,
      totalThreads: threads.count || 0,
      pendingReports: pendingReports.count || 0,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_banned, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Role must be user or admin' });
    const { data, error } = await supabase.from('users').update({ role }).eq('id', req.params.id).select('id, role').single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res, next) => {
  try {
    const { is_banned } = req.body;
    const { data, error } = await supabase
      .from('users').update({ is_banned: Boolean(is_banned) }).eq('id', req.params.id).select('id, is_banned').single();
    if (error) throw error;
    res.json({ user: data, message: is_banned ? 'User banned' : 'User unbanned' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/posts
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('threads')
      .select(`
        id, title, category, tags, is_pinned, is_deleted, created_at,
        users!threads_user_id_fkey(id, first_name, last_name, email),
        comments(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ posts: data, total: count });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/posts/:id/pin
const pinPost = async (req, res, next) => {
  try {
    const { is_pinned } = req.body;
    const { data, error } = await supabase
      .from('threads').update({ is_pinned: Boolean(is_pinned) }).eq('id', req.params.id).select('id, is_pinned').single();
    if (error) throw error;
    res.json({ post: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/posts/:id
const deletePost = async (req, res, next) => {
  try {
    await supabase.from('threads').update({ is_deleted: true, deleted_by: req.user.id }).eq('id', req.params.id);
    res.json({ message: 'Post removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getUsers, updateUserRole, banUser, getPosts, pinPost, deletePost };
