const express = require('express');
const router = express.Router();
const { getThreads, getThread, createThread, updateThread, deleteThread, createComment, deleteComment, getUserComments, getMyThreads, getMyComments } = require('../controllers/forumController');
const { requireAuth } = require('../middleware/auth');
const { uploadThreadImage } = require('../middleware/upload');

router.get('/threads',           getThreads);
router.get('/threads/:id',       getThread);
router.post('/threads',          requireAuth, uploadThreadImage, createThread);
router.put('/threads/:id',       requireAuth, updateThread);
router.delete('/threads/:id',    requireAuth, deleteThread);
router.post('/threads/:id/comments', requireAuth, createComment);
router.delete('/comments/:id',   requireAuth, deleteComment);
router.get('/comments/by-user/:userId', getUserComments);

// Auth-protected "my activity" — includes soft-deleted items so user can see mod actions
router.get('/my-threads',  requireAuth, getMyThreads);
router.get('/my-comments', requireAuth, getMyComments);

module.exports = router;
