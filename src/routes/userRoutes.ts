import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users/profile -> Fully Protected Endpoint
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // If execution reaches here, the token is 100% valid!
  return res.status(200).json({
    message: "Access granted to secure profile area.",
    authenticatedUser: req.user
  });
});

export default router;