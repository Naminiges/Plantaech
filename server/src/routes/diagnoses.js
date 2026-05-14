const express = require('express');
const router = express.Router();
const { uploadDiagnosis, getHistory, getDiagnosis } = require('../controllers/diagnosisController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { uploadPlant } = require('../middleware/upload');

router.post('/upload', optionalAuth, (req, res, next) => {
  uploadPlant(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadDiagnosis);

router.get('/history', requireAuth, getHistory);
router.get('/:id', requireAuth, getDiagnosis);

module.exports = router;
