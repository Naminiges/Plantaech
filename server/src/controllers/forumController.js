const supabase = require('../config/supabase');

// GET /api/forum/threads
const getThreads = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, category, tag, search } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('threads')
      .select(`
        id, title, content, image_url, category, tags, is_pinned, created_at, updated_at,
        users!threads_user_id_fkey(id, first_name, last_name, avatar),
        comments(count)
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category) query = query.eq('category', category);
    if (tag)      query = query.contains('tags', [tag]);
    if (search)   query = query.ilike('title', `%${search}%`);
    if (req.query.user_id) query = query.eq('user_id', req.query.user_id);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ threads: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/forum/threads/:id
const getThread = async (req, res, next) => {
  try {
    const { data: thread, error } = await supabase
      .from('threads')
      .select(`
        *,
        users!threads_user_id_fkey(id, first_name, last_name, avatar)
      `)
      .eq('id', req.params.id)
      .eq('is_deleted', false)
      .single();

    if (error || !thread) return res.status(404).json({ error: 'Thread not found' });

    const { data: comments, error: ce } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey(id, first_name, last_name, avatar)
      `)
      .eq('thread_id', req.params.id)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (ce) throw ce;
    res.json({ thread, comments: comments || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/forum/threads
const createThread = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    // tags may arrive as JSON string (when sent via FormData with image)
    let tags = req.body.tags || [];
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }

    const VALID_CATEGORIES = ['penyakit_tanaman', 'tips_pertanian', 'tanya_jawab', 'pupuk_nutrisi', 'hama_pengendalian', 'umum'];
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('threads')
      .insert({ title, content, category: category || 'umum', tags, image_url: imageUrl, user_id: req.user.id })
      .select(`*, users!threads_user_id_fkey(id, first_name, last_name, avatar)`)
      .single();

    if (error) throw error;
    res.status(201).json({ thread: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/forum/threads/:id
const updateThread = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const { data: thread } = await supabase.from('threads').select('user_id').eq('id', req.params.id).single();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (thread.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('threads').update({ title, content, category, tags }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ thread: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/forum/threads/:id
const deleteThread = async (req, res, next) => {
  try {
    const { data: thread } = await supabase.from('threads').select('user_id').eq('id', req.params.id).single();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (thread.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await supabase.from('threads').update({ is_deleted: true, deleted_by: req.user.id }).eq('id', req.params.id);
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/forum/threads/:id/comments
const createComment = async (req, res, next) => {
  try {
    const { content, parent_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const { data: thread } = await supabase.from('threads').select('id').eq('id', req.params.id).eq('is_deleted', false).single();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const { data, error } = await supabase
      .from('comments')
      .insert({ content, thread_id: req.params.id, user_id: req.user.id, parent_id: parent_id || null })
      .select(`*, users!comments_user_id_fkey(id, first_name, last_name, avatar)`)
      .single();

    if (error) throw error;
    res.status(201).json({ comment: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/forum/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const { data: comment } = await supabase.from('comments').select('user_id').eq('id', req.params.id).single();
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await supabase.from('comments').update({ is_deleted: true, deleted_by: req.user.id }).eq('id', req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/forum/comments/by-user/:userId
const getUserComments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, content, created_at,
        threads!comments_thread_id_fkey(id, title, is_deleted)
      `)
      .eq('user_id', req.params.userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ comments: data });
  } catch (err) { next(err); }
};

// GET /api/forum/my-threads  (auth-protected, includes deleted for owner's view)
const getMyThreads = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('id, title, content, is_deleted, deleted_by, category, created_at, comments(count)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ threads: data });
  } catch (err) { next(err); }
};

// GET /api/forum/my-comments  (auth-protected, includes deleted for owner's view)
const getMyComments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, content, is_deleted, deleted_by, created_at,
        threads!comments_thread_id_fkey(id, title, is_deleted, deleted_by)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ comments: data });
  } catch (err) { next(err); }
};

module.exports = { getThreads, getThread, createThread, updateThread, deleteThread, createComment, deleteComment, getUserComments, getMyThreads, getMyComments };
