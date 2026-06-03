const express = require('express');
const { sendContactEmail } = require('../services/emailService');

const router = express.Router();

// POST /api/misc/contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await sendContactEmail(name, email, subject, message);

    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
