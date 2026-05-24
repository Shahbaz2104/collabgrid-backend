import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Forbidden: You do not have the required permissions to perform this action." 
      });
    }

    next(); // User has the required role, let them through!
  };
};