const supabase = require('../config/supabase');
const aiService = require('../services/aiService');
const path = require('path');

// POST /api/diagnoses/upload
const uploadDiagnosis = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const imageUrl = `/uploads/${req.file.filename}`;
    const result = await aiService.analyzeImage(req.file.path);

    const diagnosisData = {
      image_url: imageUrl,
      disease_name: result.disease_name,
      scientific_name: result.scientific_name,
      confidence: result.confidence,
      severity: result.severity,
      immediate_action: result.immediate_action,
      treatment_plan: result.treatment_plan,
      metadata: result.metadata || {},
      user_id: req.user ? req.user.id : null,
    };

    const { data: diagnosis, error } = await supabase
      .from('diagnoses')
      .insert(diagnosisData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ diagnosis });
  } catch (err) {
    next(err);
  }
};

// GET /api/diagnoses/history
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({ diagnoses: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/diagnoses/:id
const getDiagnosis = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Diagnosis not found' });

    // Owner or admin only
    if (data.user_id && data.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ diagnosis: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDiagnosis, getHistory, getDiagnosis };
