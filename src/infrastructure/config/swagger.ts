import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: `
Backend API for a multi-role finance dashboard.

**Transactions represent financial records in this system.**

### Roles and Permissions

| Role     | Transactions       | Dashboard | Users               |
|----------|--------------------|-----------|---------------------|
| viewer   | Read only          | —         | —                   |
| analyst  | Read only          | Read      | —                   |
| admin    | Full CRUD          | Read      | Create, Read, Update|

### Authentication
All protected endpoints require a Bearer token obtained from \`POST /auth/login\`.
Include it in the \`Authorization\` header as: \`Bearer <token>\`
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://finance-dashboard-backend-y7pn.onrender.com/api/v1',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the accessToken from the login response',
        },
      },
      schemas: {
        // ── Enums ──────────────────────────────────────
        UserRole: {
          type: 'string',
          enum: ['viewer', 'analyst', 'admin'],
          example: 'analyst',
        },
        TransactionType: {
          type: 'string',
          enum: ['income', 'expense'],
          example: 'income',
        },

        // ── User ───────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:          { type: 'string', example: '664a1b2c3d4e5f6g7h8i9j0k' },
            email:       { type: 'string', example: 'admin@example.com' },
            firstName:   { type: 'string', example: 'System' },
            lastName:    { type: 'string', example: 'Administrator' },
            role:        { $ref: '#/components/schemas/UserRole' },
            isActive:    { type: 'boolean', example: true },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' },
          },
        },
        CreateUserBody: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            email:     { type: 'string', format: 'email', example: 'newuser@example.com' },
            password:  { type: 'string', minLength: 8, example: 'NewUser@123', description: 'Must contain uppercase, lowercase, and a number' },
            firstName: { type: 'string', example: 'New' },
            lastName:  { type: 'string', example: 'User' },
            role:      { $ref: '#/components/schemas/UserRole' },
          },
        },
        UpdateUserBody: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Updated' },
            lastName:  { type: 'string', example: 'Name' },
            role:      { $ref: '#/components/schemas/UserRole' },
            isActive:  { type: 'boolean', example: false },
          },
        },

        // ── Transaction ────────────────────────────────
        Transaction: {
          type: 'object',
          properties: {
            id:        { type: 'string', example: '664a1b2c3d4e5f6g7h8i9j0k' },
            userId:    { type: 'string', example: '664a1b2c3d4e5f6g7h8i9j0k' },
            amount:    { type: 'number', example: 75000 },
            type:      { $ref: '#/components/schemas/TransactionType' },
            category:  { type: 'string', example: 'salary' },
            date:      { type: 'string', format: 'date-time' },
            notes:     { type: 'string', example: 'April salary', nullable: true },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransactionBody: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            amount:   { type: 'number', minimum: 0.01, example: 75000 },
            type:     { $ref: '#/components/schemas/TransactionType' },
            category: { type: 'string', example: 'salary' },
            date:     { type: 'string', format: 'date', example: '2025-04-01' },
            notes:    { type: 'string', maxLength: 500, example: 'April salary' },
          },
        },
        UpdateTransactionBody: {
          type: 'object',
          properties: {
            amount:   { type: 'number', minimum: 0.01, example: 80000 },
            type:     { $ref: '#/components/schemas/TransactionType' },
            category: { type: 'string', example: 'bonus' },
            date:     { type: 'string', format: 'date', example: '2025-04-15' },
            notes:    { type: 'string', maxLength: 500, example: 'Updated notes' },
          },
        },

        // ── Dashboard ──────────────────────────────────
        CategoryTotal: {
          type: 'object',
          properties: {
            _id:   { type: 'string', example: 'salary' },
            total: { type: 'number', example: 50000 },
          },
        },
        MonthlyTrend: {
          type: 'object',
          properties: {
            _id: {
              type: 'object',
              properties: {
                year:  { type: 'integer', example: 2025 },
                month: { type: 'integer', example: 4 },
              },
            },
            income:   { type: 'number', example: 60000 },
            expenses: { type: 'number', example: 21000 },
          },
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome:         { type: 'number', example: 60000 },
            totalExpenses:       { type: 'number', example: 21000 },
            netBalance:          { type: 'number', example: 39000 },
            categoryTotals:      { type: 'array', items: { $ref: '#/components/schemas/CategoryTotal' } },
            monthlyTrends:       { type: 'array', items: { $ref: '#/components/schemas/MonthlyTrend' } },
            recentTransactions:  { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
          },
        },

        // ── Shared responses ───────────────────────────
        Pagination: {
          type: 'object',
          properties: {
            total:      { type: 'integer', example: 42 },
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'UNAUTHORIZED' },
                message: { type: 'string', example: 'Invalid or expired token' },
              },
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                errors: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  example: { amount: ['Amount must be greater than 0'] },
                },
              },
            },
          },
        },
      },

      // ── Reusable responses ─────────────────────────
      responses: {
        Unauthorized: {
          description: 'Missing or invalid token',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        Forbidden: {
          description: 'Authenticated but insufficient role',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ValidationError: {
          description: 'Zod validation failed',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } },
          },
        },
      },
    },

    // ── Paths ────────────────────────────────────────────
    paths: {
      // ── Health ────────────────────────────────────────
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status:    { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Auth ──────────────────────────────────────────
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          description: 'Authenticates a user and returns a JWT access token.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'admin@example.com' },
                    password: { type: 'string', example: 'Admin@123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          accessToken: { type: 'string', example: 'eyJhbGci...' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          description: 'Returns the profile of the currently authenticated user.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      // ── Users ─────────────────────────────────────────
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          description: 'Returns a paginated list of active users. **Admin only.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          ],
          responses: {
            200: {
              description: 'Paginated user list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:    { type: 'boolean', example: true },
                      data:       { type: 'array', items: { $ref: '#/components/schemas/User' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create user',
          description: 'Creates a new user with a specified role. **Admin only.**',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateUserBody' } },
            },
          },
          responses: {
            201: {
              description: 'User created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data:    { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            409: {
              description: 'Email already registered',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/users/{id}': {
        patch: {
          tags: ['Users'],
          summary: 'Update user',
          description: 'Updates a user\'s role or active status. **Admin only.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateUserBody' } },
            },
          },
          responses: {
            200: {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data:    { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },

      // ── Transactions ──────────────────────────────────
      '/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List transactions',
          description: 'Returns paginated financial records. Supports filtering by type, category, and date range. **All roles.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type',      in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
            { name: 'category',  in: 'query', schema: { type: 'string' }, description: 'Case-insensitive partial match' },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2025-01-01' },
            { name: 'endDate',   in: 'query', schema: { type: 'string', format: 'date' }, example: '2025-12-31' },
            { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit',     in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          ],
          responses: {
            200: {
              description: 'Paginated transaction list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:    { type: 'boolean', example: true },
                      data:       { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Create transaction',
          description: 'Creates a new financial record. The `userId` is taken from the authenticated token. **Admin only.**',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionBody' } },
            },
          },
          responses: {
            201: {
              description: 'Transaction created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data:    { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/transactions/{id}': {
        patch: {
          tags: ['Transactions'],
          summary: 'Update transaction',
          description: 'Updates an existing financial record. **Admin only.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateTransactionBody' } },
            },
          },
          responses: {
            200: {
              description: 'Transaction updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data:    { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete transaction',
          description: 'Soft-deletes a financial record by setting `deletedAt`. The record is excluded from all future queries. **Admin only.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Transaction deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction deleted successfully' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      // ── Dashboard ─────────────────────────────────────
      '/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard summary',
          description: `Returns aggregated financial data computed via MongoDB aggregation pipelines.

**Includes:**
- Total income and total expenses
- Net balance (income − expenses)
- Category-wise totals sorted by amount
- Monthly income vs expense trends (last 12 months)
- 5 most recent transactions

**Analyst and Admin only.**`,
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter summary to a specific user (optional)',
            },
          ],
          responses: {
            200: {
              description: 'Dashboard summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data:    { $ref: '#/components/schemas/DashboardSummary' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);