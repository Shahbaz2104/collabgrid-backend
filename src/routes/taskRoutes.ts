import { Router } from 'express';
import { createTask, updateTask } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createTask);       // POST /api/tasks     -> Add a task
router.patch('/:id', updateTask);   // PATCH /api/tasks/:id -> Move/edit a task

export default router;