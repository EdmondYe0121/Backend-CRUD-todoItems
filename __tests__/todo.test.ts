import request from 'supertest';
import app from '../src/app';

describe('Todo API Tests', () => {
  let authToken: string;
  let createdTodoId: string;

  // Helper function to login and get token
  const loginAndGetToken = async () => {
    const loginData = {
      email: 'user1@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    return response.body.data.token;
  };

  beforeAll(async () => {
    authToken = await loginAndGetToken();
  });

  describe('GET /api/todos', () => {
    describe('Success Cases', () => {
      it('should get all todos without authentication', async () => {
        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.count).toBe(response.body.data.length);
      });

      it('should filter todos by category', async () => {
        const response = await request(app)
          .get('/api/todos?category=work')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(todo.category.toLowerCase()).toBe('work');
        });
      });

      it('should filter todos by completed status', async () => {
        const response = await request(app)
          .get('/api/todos?completed=true')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(todo.completed).toBe(true);
        });
      });

      it('should filter todos by priority', async () => {
        const response = await request(app)
          .get('/api/todos?priority=high')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(todo.priority).toBe('high');
        });
      });

      it('should filter todos by owner ID', async () => {
        const response = await request(app)
          .get('/api/todos?ownerId=user_1')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(todo.ownerId).toBe('user_1');
        });
      });

      it('should search todos by title and description', async () => {
        const response = await request(app)
          .get('/api/todos?search=backend')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          const titleMatch = todo.title.toLowerCase().includes('backend');
          const descriptionMatch = todo.description && todo.description.toLowerCase().includes('backend');
          expect(titleMatch || descriptionMatch).toBe(true);
        });
      });

      it('should filter todos by due date', async () => {
        const dueDate = '2024-09-01';
        const response = await request(app)
          .get(`/api/todos?dueDate=${dueDate}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(new Date(todo.dueDate) <= new Date(dueDate)).toBe(true);
        });
      });

      it('should combine multiple filters', async () => {
        const response = await request(app)
          .get('/api/todos?category=work&priority=high&completed=false')
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((todo: any) => {
          expect(todo.category.toLowerCase()).toBe('work');
          expect(todo.priority).toBe('high');
          expect(todo.completed).toBe(false);
        });
      });
    });

    describe('Response Structure', () => {
      it('should return todos with correct structure', async () => {
        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        if (response.body.data.length > 0) {
          const todo = response.body.data[0];
          expect(todo).toHaveProperty('id');
          expect(todo).toHaveProperty('title');
          expect(todo).toHaveProperty('description');
          expect(todo).toHaveProperty('category');
          expect(todo).toHaveProperty('completed');
          expect(todo).toHaveProperty('priority');
          expect(todo).toHaveProperty('ownerId');
          expect(todo).toHaveProperty('dueDate');
          expect(todo).toHaveProperty('createdAt');
          expect(todo).toHaveProperty('updatedAt');
          
          expect(typeof todo.id).toBe('string');
          expect(typeof todo.title).toBe('string');
          expect(typeof todo.completed).toBe('boolean');
          expect(['low', 'medium', 'high']).toContain(todo.priority);
        }
      });
    });
  });

  describe('GET /api/todos/:id', () => {
    describe('Success Cases', () => {
      it('should get a specific todo by ID', async () => {
        // First get all todos to find a valid ID
        const todosResponse = await request(app).get('/api/todos');
        
        if (todosResponse.body.data.length > 0) {
          const todoId = todosResponse.body.data[0].id;
          
          const response = await request(app)
            .get(`/api/todos/${todoId}`)
            .expect(200);

          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('data');
          expect(response.body.data.id).toBe(todoId);
        }
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent todo ID', async () => {
        const response = await request(app)
          .get('/api/todos/non_existent_id')
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Todo not found');
      });
    });
  });

  describe('POST /api/todos', () => {
    describe('Success Cases', () => {
      it('should create a todo with all fields', async () => {
        const todoData = {
          title: 'Test Todo',
          description: 'This is a test todo',
          category: 'test',
          priority: 'medium' as const,
          dueDate: new Date('2024-12-31').toISOString()
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Todo created successfully');
        expect(response.body).toHaveProperty('data');

        const createdTodo = response.body.data;
        expect(createdTodo.title).toBe(todoData.title);
        expect(createdTodo.description).toBe(todoData.description);
        expect(createdTodo.category).toBe(todoData.category);
        expect(createdTodo.priority).toBe(todoData.priority);
        expect(createdTodo.completed).toBe(false);
        expect(createdTodo.ownerId).toBe('user_1');
        expect(createdTodo).toHaveProperty('id');
        expect(createdTodo).toHaveProperty('createdAt');
        expect(createdTodo).toHaveProperty('updatedAt');

        // Store the created todo ID for later tests
        createdTodoId = createdTodo.id;
      });

      it('should create a todo with only required fields', async () => {
        const todoData = {
          title: 'Minimal Todo',
          category: 'minimal'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(todoData.title);
        expect(response.body.data.category).toBe(todoData.category);
        expect(response.body.data.completed).toBe(false);
      });
    });

    describe('Authentication Tests', () => {
      it('should require authentication', async () => {
        const todoData = {
          title: 'Unauthorized Todo',
          category: 'test'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Authentication failed');
      });

      it('should reject invalid token', async () => {
        const todoData = {
          title: 'Invalid Token Todo',
          category: 'test'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', 'Bearer invalid_token')
          .send(todoData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      });
    });

    describe('Validation Tests', () => {
      it('should return 400 when title is missing', async () => {
        const todoData = {
          category: 'test'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Title and category are required');
      });

      it('should return 400 when category is missing', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Title and category are required');
      });

      it('should return 400 when both title and category are missing', async () => {
        const todoData = {
          description: 'No title or category'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Title and category are required');
      });

      it('should return 400 for empty title', async () => {
        const todoData = {
          title: '',
          category: 'test'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Title and category are required');
      });

      it('should return 400 for empty category', async () => {
        const todoData = {
          title: 'Test Todo',
          category: ''
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Title and category are required');
      });
    });
  });

  describe('PATCH /api/todos/:id', () => {
    describe('Success Cases', () => {
      it('should update a todo with valid data', async () => {
        const updateData = {
          title: 'Updated Todo Title',
          description: 'Updated description',
          priority: 'high' as const,
          completed: true
        };

        const response = await request(app)
          .patch(`/api/todos/${createdTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Todo updated successfully');
        expect(response.body).toHaveProperty('data');

        const updatedTodo = response.body.data;
        expect(updatedTodo.title).toBe(updateData.title);
        expect(updatedTodo.description).toBe(updateData.description);
        expect(updatedTodo.priority).toBe(updateData.priority);
        expect(updatedTodo.completed).toBe(updateData.completed);
        expect(updatedTodo.id).toBe(createdTodoId);
      });

      it('should update only specific fields', async () => {
        const updateData = {
          title: 'Partially Updated Todo'
        };

        const response = await request(app)
          .patch(`/api/todos/${createdTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updateData.title);
        // Other fields should remain unchanged
        expect(response.body.data.id).toBe(createdTodoId);
      });
    });

    describe('Authentication Tests', () => {
      it('should require authentication', async () => {
        const updateData = {
          title: 'Unauthorized Update'
        };

        const response = await request(app)
          .patch(`/api/todos/${createdTodoId}`)
          .send(updateData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Authentication failed');
      });

      it('should reject invalid token', async () => {
        const updateData = {
          title: 'Invalid Token Update'
        };

        const response = await request(app)
          .patch(`/api/todos/${createdTodoId}`)
          .set('Authorization', 'Bearer invalid_token')
          .send(updateData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent todo', async () => {
        const updateData = {
          title: 'Update Non-existent Todo'
        };

        const response = await request(app)
          .patch('/api/todos/non_existent_id')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.error).toContain('not found');
      });

      // Note: Testing unauthorized access would require creating another user
      // For now, we'll test with the same user who owns the todo
      
      it('should not allow non-owner to update todo', async () => {
        // Get token for second user
        const user2Token = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user2@example.com',
            password: 'password456'
          })
          .then(res => res.body.data.token);

        // Try to update a todo owned by user_1 using user_2's token
        const updateData = {
          title: 'Unauthorized Update Attempt'
        };

        const response = await request(app)
          .patch(`/api/todos/todo_1`) // This is owned by user_1
          .set('Authorization', `Bearer ${user2Token}`)
          .send(updateData)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to update this todo');
      });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    describe('Success Cases', () => {
      it('should delete a todo successfully', async () => {
        const response = await request(app)
          .delete(`/api/todos/${createdTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Todo deleted successfully');

        // Verify the todo is actually deleted
        const getResponse = await request(app)
          .get(`/api/todos/${createdTodoId}`)
          .expect(404);

        expect(getResponse.body).toHaveProperty('success', false);
        expect(getResponse.body).toHaveProperty('error', 'Todo not found');
      });
    });

    describe('Authentication Tests', () => {
      it('should require authentication', async () => {
        // Create a new todo for this test
        const todoData = {
          title: 'Todo to Delete Without Auth',
          category: 'test'
        };

        const createResponse = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData);

        const todoId = createResponse.body.data.id;

        const response = await request(app)
          .delete(`/api/todos/${todoId}`)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Authentication failed');
      });

      it('should reject invalid token', async () => {
        // Create a new todo for this test
        const todoData = {
          title: 'Todo to Delete With Invalid Token',
          category: 'test'
        };

        const createResponse = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData);

        const todoId = createResponse.body.data.id;

        const response = await request(app)
          .delete(`/api/todos/${todoId}`)
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent todo', async () => {
        const response = await request(app)
          .delete('/api/todos/non_existent_id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.error).toContain('not found');
      });

      it('should not allow non-owner to delete todo', async () => {
        // Get token for second user
        const user2Token = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user2@example.com',
            password: 'password456'
          })
          .then(res => res.body.data.token);

        // Try to delete a todo owned by user_1 using user_2's token
        const response = await request(app)
          .delete('/api/todos/todo_2') // This is owned by user_1
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to delete this todo');
      });
    });
  });

  describe('Ownership Authorization Tests', () => {
    let user2Token: string;
    let user1CreatedTodoId: string;
    let user2CreatedTodoId: string;

    beforeAll(async () => {
      // Get token for second user
      user2Token = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user2@example.com',
          password: 'password456'
        })
        .then(res => res.body.data.token);

      // Create a todo with user1
      const user1Todo = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'User 1 Todo for Ownership Test',
          category: 'ownership-test'
        });
      user1CreatedTodoId = user1Todo.body.data.id;

      // Create a todo with user2
      const user2Todo = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'User 2 Todo for Ownership Test',
          category: 'ownership-test'
        });
      user2CreatedTodoId = user2Todo.body.data.id;
    });

    describe('Cross-user Update Restrictions', () => {
      it('should allow owner to update their own todo', async () => {
        const updateData = {
          title: 'Updated by Owner (User 1)',
          completed: true
        };

        const response = await request(app)
          .patch(`/api/todos/${user1CreatedTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.title).toBe(updateData.title);
        expect(response.body.data.completed).toBe(true);
      });

      it('should prevent user2 from updating user1 todo', async () => {
        const updateData = {
          title: 'Unauthorized Update by User 2'
        };

        const response = await request(app)
          .patch(`/api/todos/${user1CreatedTodoId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send(updateData)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to update this todo');
      });

      it('should prevent user1 from updating user2 todo', async () => {
        const updateData = {
          title: 'Unauthorized Update by User 1'
        };

        const response = await request(app)
          .patch(`/api/todos/${user2CreatedTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to update this todo');
      });
    });

    describe('Cross-user Delete Restrictions', () => {
      it('should prevent user2 from deleting user1 todo', async () => {
        const response = await request(app)
          .delete(`/api/todos/${user1CreatedTodoId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to delete this todo');
      });

      it('should prevent user1 from deleting user2 todo', async () => {
        const response = await request(app)
          .delete(`/api/todos/${user2CreatedTodoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Not authorized to delete this todo');
      });

      it('should allow owner to delete their own todo', async () => {
        const response = await request(app)
          .delete(`/api/todos/${user2CreatedTodoId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Todo deleted successfully');

        // Verify the todo is actually deleted
        const getResponse = await request(app)
          .get(`/api/todos/${user2CreatedTodoId}`)
          .expect(404);

        expect(getResponse.body).toHaveProperty('error', 'Todo not found');
      });
    });

    describe('Todo Creation Ownership', () => {
      it('should assign correct owner when user1 creates todo', async () => {
        const todoData = {
          title: 'User 1 Ownership Test',
          category: 'ownership'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(todoData)
          .expect(201);

        expect(response.body.data.ownerId).toBe('user_1');
      });

      it('should assign correct owner when user2 creates todo', async () => {
        const todoData = {
          title: 'User 2 Ownership Test',
          category: 'ownership'
        };

        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${user2Token}`)
          .send(todoData)
          .expect(201);

        expect(response.body.data.ownerId).toBe('user_2');
      });
    });
  });

  describe('Content Type and Response Format Tests', () => {
    it('should return JSON responses', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/);

      expect(response.body).toBeDefined();
    });

    it('should handle JSON content type for POST requests', async () => {
      const todoData = {
        title: 'JSON Content Type Test',
        category: 'test'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should respond to GET requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/todos')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });

    it('should respond to POST requests within reasonable time', async () => {
      const startTime = Date.now();
      
      const todoData = {
        title: 'Performance Test Todo',
        category: 'performance'
      };

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long todo titles', async () => {
      const longTitle = 'A'.repeat(1000); // Very long title
      const todoData = {
        title: longTitle,
        category: 'edge-case'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(longTitle);
    });

    it('should handle special characters in todo data', async () => {
      const todoData = {
        title: 'Special Characters: !@#$%^&*(){}[]|\\:";\'<>?,./',
        description: 'Test with émojis 🚀 and üñíçødé',
        category: 'special-chars'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(todoData.title);
      expect(response.body.data.description).toBe(todoData.description);
    });

    it('should handle null and undefined values in optional fields', async () => {
      const todoData = {
        title: 'Todo with null/undefined',
        category: 'edge-case',
        description: null,
        priority: undefined
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
