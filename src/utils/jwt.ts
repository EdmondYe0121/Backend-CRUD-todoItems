import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/models/user_model';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '12h';

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload as any, JWT_SECRET, { 
        expiresIn: JWT_EXPIRATION 
    } as any);
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JWTPayload;
    } catch (error) {
        console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
};

export const extractToken = (authHeader: string | undefined): string | null => {
    if (!authHeader) {
        throw new Error('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
        throw new Error('Invalid authorization format. Use: Bearer <token>');
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
};