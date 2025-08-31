import { Request, Response } from "express";
import { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo } from "@/services/todo_service";
import { CreateTodoRequest, UpdateTodoRequest, TodoFilters } from "@/models/todo_model";

// GET /todos
export const getTodosController = async (req: Request, res: Response) => {
    try {
        const filters: TodoFilters = {
            ownerId: req.query.ownerId as string,
            category: req.query.category as string, 
            completed: req.query.completed ? req.query.completed === 'true' : undefined,
            priority: req.query.priority as 'low' | 'medium' | 'high',
            search: req.query.search as string,
            dueDate: req.query.dueDate ? new Date(req.query.dueDate as string) : undefined
        };

        const todos = getAllTodos(filters);

        return res.status(200).json({
            success: true,
            data: todos,
            count: todos.length
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get todos';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// GET /todos/:id
export const getTodoController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const todo = getTodoById(id);

        if (!todo) {
            return res.status(404).json({
                success: false,
                error: 'Todo not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: todo
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get todo';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// POST /todos
export const createTodoController = async (req: Request, res: Response) => {
    try {
        const todoData: CreateTodoRequest = req.body;
        const ownerId = req.user!.id;

        if (!todoData.title || !todoData.category) {
            return res.status(400).json({
                success: false,
                error: 'Title and category are required'
            });
        }

        const newTodo = createTodo(todoData, ownerId);

        return res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: newTodo
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// PATCH /todos/:id
export const updateTodoController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: UpdateTodoRequest = req.body;
        const userId = req.user!.id;

        const updatedTodo = updateTodo(id, updates, userId);

        return res.status(200).json({
            success: true,
            message: 'Todo updated successfully',
            data: updatedTodo
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
        
        if (errorMessage.includes('not found')) {
            return res.status(404).json({ success: false, error: errorMessage });
        }
        if (errorMessage.includes('Not authorized')) {
            return res.status(403).json({ success: false, error: errorMessage });
        }
        
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// DELETE /todos/:id
export const deleteTodoController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        deleteTodo(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Todo deleted successfully'
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
        
        if (errorMessage.includes('not found')) {
            return res.status(404).json({ success: false, error: errorMessage });
        }
        if (errorMessage.includes('Not authorized')) {
            return res.status(403).json({ success: false, error: errorMessage });
        }
        
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
