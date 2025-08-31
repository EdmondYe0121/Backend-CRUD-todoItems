import { Request, Response } from "express";
import { createUser, loginUser } from "@/services/auth_service";
import { CreateUserRequest, LoginRequest } from "@/models/user_model";

// POST /auth/login
export const loginController = async (req: Request, res: Response) => {
    const loginData: LoginRequest = req.body;
    
    try {
        if (!loginData.email || !loginData.password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const result = await loginUser(loginData);

        return res.status(200).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(401).json(
            {success: false, 
            error: errorMessage });
    }
};

// POST /auth/register
export const registerController = async (req: Request, res: Response) => {
    const userData: CreateUserRequest = req.body;

    try {
        const result = await createUser(userData);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({
            success: false,
            error: errorMessage
        });
    }
};