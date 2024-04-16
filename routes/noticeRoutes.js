const express = require('express');
const noticeController = require('../controllers/noticeController');
const auth = require('../middleware/auth');

const router = express.Router();

// // Notice-related routes
router.post('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => noticeController.createNotice(req, res));
router.get('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => noticeController.getNotices(req, res));
router.get('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => noticeController.getNoticeById(req, res));
router.put('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => noticeController.updateNotice(req, res));
router.delete('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => noticeController.deleteNotice(req, res));


module.exports = router;