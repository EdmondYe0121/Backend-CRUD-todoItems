import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters } from "@/models/todo_model";

const todos: Todo[] = [];

const initializeDemoTodos = () => {
    const demoTodos: Todo[] = [
        {
            id: 'todo_1',
            title: 'Complete backend API',
            description: 'Build the todo CRUD API with authentication',
            category: 'work',
            completed: false,
            priority: 'high',
            ownerId: 'user_1',
            dueDate: new Date('2024-09-01'),
            createdAt: new Date('2024-08-30'),
            updatedAt: new Date('2024-08-30')
        },
        {
            id: 'todo_2', 
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, vegetables',
            category: 'personal',
            completed: true,
            priority: 'medium',
            ownerId: 'user_1',
            dueDate: new Date('2024-09-02'),
            createdAt: new Date('2024-08-30'),
            updatedAt: new Date('2024-08-30')
        },
        {
            id: 'todo_3',
            title: 'Plan weekend trip',
            description: 'Research destinations and book accommodation',
            category: 'personal',
            completed: false,
            priority: 'low',
            ownerId: 'user_1',
            dueDate: new Date('2024-09-05'),
            createdAt: new Date('2024-08-30'),
            updatedAt: new Date('2024-08-30')
        }
    ];
    
    todos.push(...demoTodos);
    console.log(`${demoTodos.length} demo todos initialized for user_1`);
};

initializeDemoTodos();

/**
 * Returns all todos matching optional filters.
 * @param filters - Owner, category, completion status, priority, due date, and search term.
 * - `dueDate`: filters todos due on or before this date (inclusive, end of day).
 * - `search`: case-insensitive search on title and description.
 * @returns Array of filtered todos.
 */
export const getAllTodos = (filters: TodoFilters = {}): Todo[] => {
    let filteredTodos = [...todos];

    if (filters.ownerId) {
        filteredTodos = filteredTodos.filter(todo => todo.ownerId === filters.ownerId);
    }

    if (filters.category) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.category.toLowerCase() === filters.category!.toLowerCase()
        );
    }

    if (filters.completed !== undefined) {
        filteredTodos = filteredTodos.filter(todo => todo.completed === filters.completed);
    }

    if (filters.priority) {
        filteredTodos = filteredTodos.filter(todo => todo.priority === filters.priority);
    }

    if (filters.dueDate !== undefined && filters.dueDate !== null) {
        const filterDate = new Date(filters.dueDate);
        // Normalize dueDate to end of day so filtering includes that entire day
        filterDate.setHours(23, 59, 59, 999);
        
        filteredTodos = filteredTodos.filter(todo => {
            const todoDate = new Date(todo.dueDate);
            return todoDate <= filterDate;
        });
    }

    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTodos = filteredTodos.filter(todo =>
            todo.title.toLowerCase().includes(searchTerm) ||
            (todo.description && todo.description.toLowerCase().includes(searchTerm))
        );
    }

    return filteredTodos;
}

/**
 * Finds a specific todo by its ID.
 * @param id - Todo ID to search for.
 * @returns Todo object or undefined if not found.
 */
export const getTodoById = (id: string): Todo | undefined => {
    return todos.find(todo => todo.id === id);
}

/**
 * Creates a new todo for the specified owner.
 * @param todoData - Todo creation data (title, description, category, etc.).
 * @param ownerId - User ID of the todo owner.
 * @returns The created todo object.
 */
export const createTodo = (todoData: CreateTodoRequest, ownerId: string): Todo => {
    const processedDueDate = todoData.dueDate ? new Date(todoData.dueDate) : todoData.dueDate;
    
    const newTodo: Todo = {
        id: `todo_${Date.now()}`,
        title: todoData.title,
        description: todoData.description,
        category: todoData.category,
        completed: false,
        priority: todoData.priority,
        ownerId: ownerId,
        dueDate: processedDueDate,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    todos.push(newTodo);
    return newTodo;
}

/**
 * Updates an existing todo with ownership validation.
 * @param id - Todo ID to update.
 * @param updates - Fields to update.
 * @param userId - User ID for ownership validation.
 * @returns The updated todo object.
 */
export const updateTodo = (id: string, updates: UpdateTodoRequest, userId: string): Todo => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        throw new Error('Todo not found');
    }

    const todo = todos[todoIndex];
    
    if (todo.ownerId !== userId) {
        throw new Error('Not authorized to update this todo');
    }

    const processedUpdates = {
        ...updates,
        ...(updates.dueDate && { dueDate: new Date(updates.dueDate) })
    };

    const updatedTodo: Todo = {
        ...todo,
        ...processedUpdates,
        updatedAt: new Date()
    };

    todos[todoIndex] = updatedTodo;
    return updatedTodo;
};

/**
 * Deletes a todo with ownership validation.
 * @param id - Todo ID to delete.
 * @param userId - User ID for ownership validation.
 */
export const deleteTodo = (id: string, userId: string): void => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        throw new Error('Todo not found');
    }

    const todo = todos[todoIndex];
    
    if (todo.ownerId !== userId) {
        throw new Error('Not authorized to delete this todo');
    }

    todos.splice(todoIndex, 1);
};
