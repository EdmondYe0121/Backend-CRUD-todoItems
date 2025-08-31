import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '@/utils/jwt';
import { findUserById } from '@/services/auth_service';

/**
 * Extends Express Request interface to include user information
 * after successful authentication
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
            };
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        const user = await findUserById(decoded.sub);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        return next();
    } catch (error) {
        console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
