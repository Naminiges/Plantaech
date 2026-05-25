const supabase = require('../config/supabase');
const aiService = require('../services/aiService');
const storage = require('../services/storage');

// POST /api/diagnoses/upload
const uploadDiagnosis = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const result = await aiService.analyzeImage(req.file);

    const objectKey = storage.buildObjectKey('diagnoses', req.file.originalname);
    const imageUrl = await storage.uploadDiagnosisImage(req.file, objectKey);

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

    // Create signed URL for immediate display
    let response = diagnosis;
    if (diagnosis.image_url && diagnosis.image_url.startsWith('supabase-private://')) {
      try {
        const signedUrl = await storage.createSignedUrlFromStoragePath(diagnosis.image_url, 60 * 60);
        response = { ...diagnosis, image_signed_url: signedUrl };
      } catch (e) {
        // ignore signed url errors, return diagnosis as-is
      }
    }

    res.status(201).json({ diagnosis: response });
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

    const diagnoses = await Promise.all((data || []).map(async (d) => {
      if (d.image_url && d.image_url.startsWith('supabase-private://')) {
        try {
          const signedUrl = await storage.createSignedUrlFromStoragePath(d.image_url, 60 * 60);
          return { ...d, image_signed_url: signedUrl };
        } catch (e) {
          return d;
        }
      }
      return d;
    }));

    res.json({ diagnoses, total: count, page: parseInt(page), limit: parseInt(limit) });
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

    let diagnosis = data;
    if (data.image_url && data.image_url.startsWith('supabase-private://')) {
      try {
        const signedUrl = await storage.createSignedUrlFromStoragePath(data.image_url, 60 * 60);
        diagnosis = { ...data, image_signed_url: signedUrl };
      } catch (e) {
        // ignore signed url errors
      }
    }

    res.json({ diagnosis });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/diagnoses/:id
const deleteDiagnosis = async (req, res, next) => {
  try {
    // Verify ownership first
    const { data, error: fetchError } = await supabase
      .from('diagnoses')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !data) return res.status(404).json({ error: 'Diagnosis not found' });

    if (data.user_id && data.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error: deleteError } = await supabase
      .from('diagnoses')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDiagnosis, getHistory, getDiagnosis, deleteDiagnosis };
