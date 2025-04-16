import express from 'express';
import { getTaskForUser, submitTaskAnswer,getUserTaskStatuses } from '../controllers/usertask.controller.js';

const router = express.Router();

// Route to fetch the task for the user
router.get('/task/:taskId/user/:userId', getTaskForUser);
// Add this to your routes
router.get('/status/:userId', getUserTaskStatuses);
// Route to submit the task answer
router.post('/task/:taskId/user/:userId/submit', submitTaskAnswer);
export default router;
