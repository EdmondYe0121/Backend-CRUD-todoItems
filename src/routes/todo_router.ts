import { Router } from "express";
import { getTodosController, getTodoController, createTodoController, updateTodoController, deleteTodoController } from "@/controllers/todo_controller";
import { authenticateToken } from "@/middleware/auth_middleware";
const router = Router();


/**
 * @openapi
 * /api/todos:
 *   get:
 *     summary: Get all todos (with optional filters)
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filter by owner ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by due date
 *     responses:
 *       200:
 *         description: List of todos
 *       500:
 *         description: Internal server error
 */
router.get('/', getTodosController);

/**
 * @openapi
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by todo ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo found
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTodoController);


/**
 * @openapi
 * /api/todos:
 *   post:
 *     summary: Create a new todo (title, category required; description, dueDate, priority optional)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Todo title
 *               category:
 *                 type: string
 *                 description: Todo category
 *               description:
 *                 type: string
 *                 description: Todo description (optional)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date (optional)
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Priority (optional)
 *     responses:
 *       201:
 *         description: Todo created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, createTodoController);

/**
 * @openapi
 * /api/todos/{id}:
 *   patch:
 *     summary: Update a todo given its ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Todo title 
 *               category:
 *                 type: string
 *                 description: Todo category 
 *               description:
 *                 type: string
 *                 description: Todo description
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Priority
 *     responses:
 *       200:
 *         description: Todo updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticateToken, updateTodoController);

/**
 * @openapi
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo given its ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, deleteTodoController);

export default router;
