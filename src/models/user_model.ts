export interface User{
    id: string;
    email: string;
    name: string;
    password: string; 
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
}

export interface JWTPayload {
    sub: string;        // Subject (user ID)
    email: string;
    name: string;       
    iat?: number;       // Issued at (timestamp)
    exp?: number;       // Expires at (timestamp)
}