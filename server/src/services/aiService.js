/**
 * AI Service — calls the real FastAPI plant disease model.
 * Falls back to a clear error when the model is unreachable.
 *
 * The model returns prediction + confidence, but NOT treatment info.
 * Treatment data (scientific_name, severity, immediate_action, treatment_plan)
 * is mapped locally from the DISEASES knowledge base.
 */

const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

// ── Disease cache (DB-backed) ───────────────────────────────────
// Diseases are stored in the `diseases` table. We cache them in
// memory to avoid hitting the database on every single request.
let diseaseCache = { data: null, loadedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get a Map of class_key → disease from the database.
 * Results are cached for CACHE_TTL_MS milliseconds.
 */
async function getDiseaseMap() {
  if (diseaseCache.data && Date.now() - diseaseCache.loadedAt < CACHE_TTL_MS) {
    return diseaseCache.data;
  }
  const { data, error } = await supabase.from('diseases').select('*');
  if (error) throw new Error(`Failed to load diseases from database: ${error.message}`);
  if (!data || data.length === 0) throw new Error('No diseases found in database. Please run the diseases_table.sql migration.');
  const map = new Map();
  for (const d of data) map.set(d.class_key, d);
  diseaseCache = { data: map, loadedAt: Date.now() };
  return map;
}

/**
 * Clear the disease cache (call after admin updates a disease).
 */
function clearDiseaseCache() {
  diseaseCache = { data: null, loadedAt: 0 };
}

/**
 * Analyze an image and return disease diagnosis.
 *
 * @param {object} file - Multer file object (has .path or .buffer)
 * @returns {Promise<Object>} Diagnosis result
 */
const analyzeImage = async (file) => {
  const apiUrl = process.env.AI_MODEL_API_URL;
  if (!apiUrl) {
    throw new Error('AI_MODEL_API_URL is not configured in .env');
  }

  // Build multipart form
  const form = new FormData();

  if (file.buffer) {
    // Memory storage — Multer buffer
    const blob = new Blob([file.buffer], { type: file.mimetype });
    form.append('file', blob, file.originalname);
  } else if (file.path) {
    // Disk storage — read from path
    const buffer = fs.readFileSync(file.path);
    const blob = new Blob([buffer], { type: file.mimetype });
    form.append('file', blob, file.originalname || path.basename(file.path));
  } else {
    throw new Error('Invalid file object: no buffer or path');
  }

  // Call FastAPI model
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI model returned ${response.status}: ${text}`);
  }

  const data = await response.json();

  // Map model prediction → disease from database
  const prediction = data.prediction;
  const diseaseMap = await getDiseaseMap();
  let disease = diseaseMap.get(prediction);

  if (!disease) {
    // Unknown class from model — fallback to Non_tomato entry
    console.warn(`Unknown model prediction class: "${prediction}", falling back to Non_tomato`);
    disease = diseaseMap.get('Non_tomato');
    if (!disease) throw new Error('Non_tomato fallback disease not found in database');
  }

  const confidencePercent = parseFloat((data.confidence * 100).toFixed(1));

  return {
    ...disease,
    confidence: confidencePercent,
    metadata: {
      model_version: 'plantaech-ai-v1.0',
      analyzed_at: new Date().toISOString(),
      image_path: file.originalname || (file.path ? path.basename(file.path) : 'upload'),
      raw_prediction: prediction,
      top_k: data.top_k || [],
    },
  };
};

module.exports = { analyzeImage, clearDiseaseCache };
