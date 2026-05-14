const supabase = require('../config/supabase');

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { reason, description, thread_id, comment_id } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason is required' });
    if (!thread_id && !comment_id) return res.status(400).json({ error: 'thread_id or comment_id is required' });

    const VALID_REASONS = ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'];
    if (!VALID_REASONS.includes(reason)) return res.status(400).json({ error: 'Invalid reason' });

    const { data, error } = await supabase
      .from('reports')
      .insert({ reason, description, thread_id: thread_id || null, comment_id: comment_id || null, reporter_id: req.user.id })
      .select().single();

    if (error) throw error;
    res.status(201).json({ report: data, message: 'Report submitted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports (admin)
const getReports = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('reports')
      .select(`
        *,
        users!reports_reporter_id_fkey(id, first_name, last_name, email),
        threads(id, title),
        comments(id, content)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ reports: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reports/:id (admin)
const updateReport = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['pending', 'resolved', 'dismissed'];
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const updateData = { status };
    if (status !== 'pending') updateData.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('reports').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ report: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getReports, updateReport };
