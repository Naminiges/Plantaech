const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUserRole, banUser, getPosts, pinPost, deletePost, getDiseases, createDisease, updateDisease, deleteDisease } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', banUser);
router.get('/posts', getPosts);
router.put('/posts/:id/pin', pinPost);
router.delete('/posts/:id', deletePost);

// Disease management
router.get('/diseases', getDiseases);
router.post('/diseases', createDisease);
router.put('/diseases/:id', updateDisease);
router.delete('/diseases/:id', deleteDisease);

module.exports = router;
