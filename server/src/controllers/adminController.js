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

// ── Disease Management ─────────────────────────────────────────
const { clearDiseaseCache } = require('../services/aiService');

// GET /api/admin/diseases
const getDiseases = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json({ diseases: data });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/diseases
const createDisease = async (req, res, next) => {
  try {
    const { class_key, disease_name, scientific_name, severity, immediate_action, treatment_plan } = req.body;
    if (!class_key || !disease_name) {
      return res.status(400).json({ error: 'class_key and disease_name are required' });
    }
    const { data, error } = await supabase
      .from('diseases')
      .insert({ class_key, disease_name, scientific_name: scientific_name || null, severity: severity || null, immediate_action, treatment_plan })
      .select()
      .single();
    if (error) throw error;
    clearDiseaseCache();
    res.status(201).json({ disease: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/diseases/:id
const updateDisease = async (req, res, next) => {
  try {
    const { disease_name, scientific_name, severity, immediate_action, treatment_plan } = req.body;
    const updates = {};
    if (disease_name !== undefined) updates.disease_name = disease_name;
    if (scientific_name !== undefined) updates.scientific_name = scientific_name || null;
    if (severity !== undefined) updates.severity = severity || null;
    if (immediate_action !== undefined) updates.immediate_action = immediate_action;
    if (treatment_plan !== undefined) updates.treatment_plan = treatment_plan;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('diseases')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    clearDiseaseCache();
    res.json({ disease: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/diseases/:id
const deleteDisease = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('diseases')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    clearDiseaseCache();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent an admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account from here.' });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'User account successfully deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getUsers, updateUserRole, banUser, deleteUser, getPosts, pinPost, deletePost, getDiseases, createDisease, updateDisease, deleteDisease };
