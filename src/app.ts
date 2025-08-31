import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerOptions';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth_router';
import todoRouter from './routes/todo_router';

const app = express();
// Swagger setup
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet());
app.use(cors());

app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_PREFIX = process.env.API_PREFIX || '/api';

console.log('Registering health route...');

// Health check endpoint for monitoring and deployment probes
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json(
    {
        success: true,
        message: 'Todo API is running Successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    }
  );
});

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/todos`, todoRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
  });
});

app.use((err : any, req : express.Request, res : express.Response, next : express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
});

export default app;