import { Router } from "express";
import { getTodosController, getTodoController, createTodoController, updateTodoController, deleteTodoController } from "@/controllers/todo_controller";
import { authenticateToken } from "@/middleware/auth_middleware";
const router = Router();

// Public routes
router.get('/', getTodosController);
router.get('/:id', getTodoController);

// Protected routes
router.post('/', authenticateToken, createTodoController);
router.patch('/:id', authenticateToken, updateTodoController);
router.delete('/:id', authenticateToken, deleteTodoController);

export default router;
