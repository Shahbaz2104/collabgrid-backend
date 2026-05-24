import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express's Request type locally so TypeScript recognizes our custom user object
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1. Grab the Authorization header
  const authHeader = req.headers['authorization'];
  
  // 2. Parse the token out of the "Bearer <token>" format
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // 3. Verify the token signature against your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: number; role: string };
    
    // 4. Attach the decoded user data payload directly to the request object
    req.user = decoded;
    
    // 5. Pass execution control cleanly to the next function down the line
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired authentication token." });
  }
};