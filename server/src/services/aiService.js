/**
 * Mock AI Service — simulates inference from the plant disease model.
 * Replace AI_MODEL_API_URL in .env to point to real FastAPI endpoint.
 */

const path = require('path');

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
];

/**
 * Analyze an image and return disease diagnosis.
 * Currently returns mock data. Replace with real API call when model is ready.
 *
 * @param {object} file - Multer file object (buffer or path)
 * @returns {Promise<Object>} Diagnosis result
 */
const analyzeImage = async (file) => {
  // TODO: When real model is ready, replace with:
  // const axios = require('axios');
  // const FormData = require('form-data');
  // const fs = require('fs');
  // const form = new FormData();
  // if (file?.buffer) {
  //   form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
  // } else {
  //   form.append('file', fs.createReadStream(file.path));
  // }
  // const response = await axios.post(process.env.AI_MODEL_API_URL, form, { headers: form.getHeaders() });
  // return response.data;

  // Mock: simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Pick a random disease for demo (weighted towards realistic distribution)
  const random = Math.random();
  let diseaseIndex;
  if (random < 0.1) diseaseIndex = 9; // 10% healthy
  else if (random < 0.25) diseaseIndex = 0; // bacterial spot
  else if (random < 0.4) diseaseIndex = 2; // late blight
  else if (random < 0.55) diseaseIndex = 7; // TYLCV
  else diseaseIndex = Math.floor(Math.random() * 9);

  const disease = DISEASES[diseaseIndex];
  const confidence = disease.severity === 'healthy'
    ? 90 + Math.random() * 9
    : 75 + Math.random() * 22;

  const imageName = file?.originalname || (file?.path ? path.basename(file.path) : 'upload');

  return {
    ...disease,
    confidence: parseFloat(confidence.toFixed(1)),
    metadata: {
      model_version: 'mock-v1.0',
      analyzed_at: new Date().toISOString(),
      image_path: imageName,
    },
  };
};

module.exports = { analyzeImage };
