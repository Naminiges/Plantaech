const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReport } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.post('/', requireAuth, createReport);
router.get('/', requireAuth, requireAdmin, getReports);
router.put('/:id', requireAuth, requireAdmin, updateReport);

module.exports = router;
