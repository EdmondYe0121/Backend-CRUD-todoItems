import bcrypt from 'bcryptjs';
import { User, UserResponse, LoginRequest, CreateUserRequest} from '@/models/user_model';
import { generateToken } from '@/utils/jwt';

const users: User[] = [];

const initializeDemoUser = () => {
    const hashedPassword1 = bcrypt.hashSync('password123', 10);
    const demoUser1: User = {
        id: 'user_1',
        email: 'user1@example.com',
        name: 'User One',
        password: hashedPassword1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    const hashedPassword2 = bcrypt.hashSync('password456', 10);
    const demoUser2: User = {
        id: 'user_2',
        email: 'user2@example.com',
        name: 'User Two',
        password: hashedPassword2,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    users.push(demoUser1, demoUser2);
    console.log('Demo users created:');
    console.log('- user1@example.com, password: password123');
    console.log('- user2@example.com, password: password456');
};

initializeDemoUser();

/**
 * Creates a new user account with hashed password.
 * @param userData - User registration data (email, name, password).
 * @returns User data without password.
 */
export const createUser = async (userData: CreateUserRequest): Promise<UserResponse> => {
    const existingUser = users.find(u => u.name === userData.name || u.email === userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    users.push(newUser);

    return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
    };
};

/**
 * Authenticates user and returns JWT token.
 * @param loginData - User login credentials (email, password).
 * @returns JWT token and user data.
 */
export const loginUser = async (loginData: LoginRequest): Promise<{ token: string; user: UserResponse }> => {
    const { email, password } = loginData;

    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    const token = generateToken({ sub: user.id, email: user.email, name: user.name });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        },
    };
};

/**
 * Finds user by ID for authentication middleware.
 * @param id - User ID to search for.
 * @returns User data without password, or null if not found.
 */
export const findUserById = async (id: string): Promise<UserResponse | null> => {
    const user = users.find(u => u.id === id);
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    };
};
