const express = require('express');
const router = express.Router();
const methodController = require('../controllers/methodController');

// Ruta para invocar métodos
router.post('/toProcess', methodController.invokeMethod);

module.exports = router;