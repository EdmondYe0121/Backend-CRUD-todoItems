export interface Todo{
    id: string;
    title: string;
    description: string;
    category: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    ownerId: string; 
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTodoRequest {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
}

export interface UpdateTodoRequest {
    title?: string;
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
}

export interface TodoFilters {
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    search?: string;
    ownerId?: string;
    dueDate?: Date;
}

