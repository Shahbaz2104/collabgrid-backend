import { Router } from 'express';
import { createBoard, getUserBoards, deleteBoard } from '../controllers/boardController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware'; 


const router = Router();

router.use(authenticateToken);

router.post('/', createBoard);
router.get('/', getUserBoards);

// Only allow users with the 'Admin' role to delete a board 👇
router.delete('/:id', authorizeRoles('Admin'), deleteBoard);

export default router;