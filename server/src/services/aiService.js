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

// ── Knowledge base ──────────────────────────────────────────────
// Treatment info for each class the model can return.
const DISEASES = [
  {
    disease_name: 'Bacterial Spot',
    scientific_name: 'Xanthomonas vesicatoria',
    severity: 'moderate',
    immediate_action:
      'Prune and dispose of all infected leaves immediately. Avoid overhead watering and work with plants only when dry to prevent spreading.',
    treatment_plan:
      'Apply copper-based bactericide spray every 7–10 days. Ensure adequate spacing between plants for airflow. Rotate crops next season.',
  },
  {
    disease_name: 'Early Blight',
    scientific_name: 'Alternaria solani',
    severity: 'mild',
    immediate_action:
      'Remove infected lower leaves and destroy them. Avoid wetting foliage when watering.',
    treatment_plan:
      'Apply fungicide containing chlorothalonil or mancozeb every 7 days. Mulch soil to prevent spore splashing.',
  },
  {
    disease_name: 'Late Blight',
    scientific_name: 'Phytophthora infestans',
    severity: 'severe',
    immediate_action:
      'Immediately remove and destroy all infected plant material. Do not compost. Isolate affected plants.',
    treatment_plan:
      'Apply systemic fungicide (metalaxyl) immediately. Repeat every 5–7 days. Ensure good drainage and ventilation.',
  },
  {
    disease_name: 'Leaf Mold',
    scientific_name: 'Passalora fulva',
    severity: 'mild',
    immediate_action:
      'Improve air circulation around plants. Remove heavily infected leaves.',
    treatment_plan:
      'Apply fungicide spray. Reduce humidity by improving ventilation in greenhouse settings.',
  },
  {
    disease_name: 'Septoria Leaf Spot',
    scientific_name: 'Septoria lycopersici',
    severity: 'moderate',
    immediate_action:
      'Remove infected leaves at first sign. Avoid working with wet plants.',
    treatment_plan:
      'Apply fungicide every 7–10 days. Stake plants to improve airflow. Avoid overhead irrigation.',
  },
  {
    disease_name: 'Spider Mites',
    scientific_name: 'Tetranychus urticae',
    severity: 'mild',
    immediate_action:
      'Spray plants with a strong water jet to dislodge mites. Introduce predatory mites if available.',
    treatment_plan:
      'Apply miticide or insecticidal soap spray. Maintain adequate plant hydration as drought stress worsens infestations.',
  },
  {
    disease_name: 'Target Spot',
    scientific_name: 'Corynespora cassiicola',
    severity: 'moderate',
    immediate_action:
      'Remove infected leaves and destroy. Avoid wetting leaves during irrigation.',
    treatment_plan:
      'Apply fungicide (tebuconazole or difenoconazole) every 7–10 days. Improve plant spacing for airflow.',
  },
  {
    disease_name: 'Yellow Leaf Curl Virus',
    scientific_name: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
    severity: 'severe',
    immediate_action:
      'Remove and destroy severely infected plants immediately. Control whitefly populations which transmit the virus.',
    treatment_plan:
      'Use reflective mulch to deter whiteflies. Apply systemic insecticide. Plant virus-resistant tomato varieties for next season.',
  },
  {
    disease_name: 'Mosaic Virus',
    scientific_name: 'Tomato Mosaic Virus (ToMV)',
    severity: 'moderate',
    immediate_action:
      'Remove and destroy infected plants. Disinfect tools with bleach solution after each cut.',
    treatment_plan:
      'No chemical cure — focus on prevention. Control aphid vectors. Use certified virus-free seeds next season.',
  },
  {
    disease_name: 'Healthy',
    scientific_name: null,
    severity: 'healthy',
    immediate_action: 'No action required. Plant appears healthy.',
    treatment_plan:
      'Continue regular watering, fertilization, and monitoring schedules for optimal plant health.',
  },
  {
    disease_name: 'Not a Tomato Leaf',
    scientific_name: null,
    severity: null,
    immediate_action:
      'The uploaded image does not appear to be a tomato leaf. Please upload a clear photo of a tomato leaf for accurate disease detection.',
    treatment_plan:
      'Ensure the image shows a close-up of a tomato leaf with good lighting and minimal background clutter for best results.',
  },
];

// ── Model class_name → DISEASES index ───────────────────────────
const CLASS_MAP = {
  'Tomato_Bacterial_spot':                          0,
  'Tomato_Early_blight':                            1,
  'Tomato_Late_blight':                             2,
  'Tomato_Leaf_Mold':                               3,
  'Tomato_Septoria_leaf_spot':                      4,
  'Tomato_Spider_mites_Two_spotted_spider_mite':    5,
  'Tomato_Target_Spot':                             6,
  'Tomato_Tomato_YellowLeaf_Curl_Virus':            7,
  'Tomato_Tomato_mosaic_virus':                     8,
  'Tomato_healthy':                                 9,
  'Non_tomato':                                    10,
};

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

  // Map model prediction → knowledge base
  const prediction = data.prediction;
  const diseaseIndex = CLASS_MAP[prediction];

  if (diseaseIndex === undefined) {
    // Unknown class from model — fallback to Non_tomato entry
    console.warn(`Unknown model prediction class: "${prediction}", falling back to Non_tomato`);
  }

  const disease = DISEASES[diseaseIndex ?? 10]; // fallback to "Not a Plant"
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

module.exports = { analyzeImage };
