import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import sequelize from './config/database';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = fastify({ logger: true });

// Register Swagger
app.register(swagger, {
  swagger: {
    info: {
      title: 'Task Management API',
      description: 'API documentation for Task Management System',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Bearer token for authentication'
      }
    }
  }
});

app.register(swaggerUi, {
  routePrefix: '/api-docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

app.register(cors, {
  origin: true,
  credentials: true
});

app.register(authRoutes, { prefix: '/api/auth' });
app.register(taskRoutes, { prefix: '/api/tasks' });

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync();
    console.log('All models were synchronized successfully.');

    const address = await app.listen({ 
      port: parseInt(process.env.PORT || '3000'), 
      host: '0.0.0.0' 
    });
    console.log(`Server is running on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start(); 