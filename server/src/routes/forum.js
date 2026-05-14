const express = require('express');
const router = express.Router();
const { getThreads, getThread, createThread, updateThread, deleteThread, createComment, deleteComment } = require('../controllers/forumController');
const { requireAuth } = require('../middleware/auth');

router.get('/threads', getThreads);
router.get('/threads/:id', getThread);
router.post('/threads', requireAuth, createThread);
router.put('/threads/:id', requireAuth, updateThread);
router.delete('/threads/:id', requireAuth, deleteThread);
router.post('/threads/:id/comments', requireAuth, createComment);
router.delete('/comments/:id', requireAuth, deleteComment);

module.exports = router;
