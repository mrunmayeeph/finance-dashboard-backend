import express, { Application } from 'express';
import cors from 'cors';
import { config } from './infrastructure/config';
import { errorMiddleware, notFoundMiddleware } from './infrastructure/middleware/errorMiddleware';
import { createPermissionMiddleware } from './infrastructure/middleware/rbacMiddleware';

// Repositories
import { MongoUserRepository } from './infrastructure/database/mongoose/repositories/MongoUserRepository';
import { MongoTransactionRepository } from './infrastructure/database/mongoose/repositories/MongoTransactionRepository';

// Services
import { PolicyService } from './application/services/PolicyService';

// Use Cases - Auth
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { GetMeUseCase } from './application/use-cases/auth/GetMeUseCase';

// Use Cases - Users
import { CreateUserUseCase } from './application/use-cases/users/CreateUserUseCase';
import { ListUsersUseCase } from './application/use-cases/users/ListUsersUseCase';
import { UpdateUserUseCase } from './application/use-cases/users/UpdateUserUseCase';

// Use Cases - Transactions
import { CreateTransactionUseCase } from './application/use-cases/transactions/CreateTransactionUseCase';
import { ListTransactionsUseCase } from './application/use-cases/transactions/ListTransactionsUseCase';
import { UpdateTransactionUseCase } from './application/use-cases/transactions/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from './application/use-cases/transactions/DeleteTransactionUseCase';

// Use Cases - Dashboard
import { GetDashboardSummaryUseCase } from './application/use-cases/dashboard/GetDashboardSummaryUseCase';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';
import { TransactionController } from './presentation/controllers/TransactionController';
import { DashboardController } from './presentation/controllers/DashboardController';

// Routes
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { createUserRoutes } from './presentation/routes/userRoutes';
import { createTransactionRoutes } from './presentation/routes/transactionRoutes';
import { createDashboardRoutes } from './presentation/routes/dashboardRoutes';

/**
 * Creates and configures the Express application
 * Implements Dependency Injection for clean architecture
 */
export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', true);

  // Dependency Injection - Repositories
  const userRepository = new MongoUserRepository();
  const transactionRepository = new MongoTransactionRepository();

  // Dependency Injection - Services
  const policyService = new PolicyService();

  // Permission Middleware Factory
  const requirePermission = createPermissionMiddleware(policyService);

  // Dependency Injection - Use Cases

  // Auth Use Cases
  const loginUseCase = new LoginUseCase(userRepository);
  const getMeUseCase = new GetMeUseCase(userRepository);

  // User Use Cases
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);

  // Transaction Use Cases
  const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository);
  const listTransactionsUseCase = new ListTransactionsUseCase(transactionRepository);
  const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
  const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);

  // Dashboard Use Cases
  const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(transactionRepository);

  // Dependency Injection - Controllers
  
  const authController = new AuthController(loginUseCase, getMeUseCase);
  const userController = new UserController(createUserUseCase, listUsersUseCase, updateUserUseCase);
  const transactionController = new TransactionController(
    createTransactionUseCase,
    listTransactionsUseCase,
    updateTransactionUseCase,
    deleteTransactionUseCase
  );
  const dashboardController = new DashboardController(getDashboardSummaryUseCase);

  // Routes
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', createAuthRoutes(authController));
  app.use('/api/v1/users', createUserRoutes(userController, requirePermission));
  app.use('/api/v1/transactions', createTransactionRoutes(transactionController, requirePermission));
  app.use('/api/v1/dashboard', createDashboardRoutes(dashboardController, requirePermission));

  // Error Handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};