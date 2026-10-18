import express from 'express';
import { saveMessage, getMessagesBySession, clearSessionMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', saveMessage);
router.get('/:sessionId', getMessagesBySession);
router.delete('/:sessionId', clearSessionMessages);

export default router;
