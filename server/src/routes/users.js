const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAvatar, removeAvatar } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/avatar', requireAuth, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, updateAvatar);
router.delete('/avatar', requireAuth, removeAvatar);

module.exports = router;
