import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController'; // <-- Import loginUser

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser); // <-- Add this endpoint

export default router;