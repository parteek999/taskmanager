import { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../middleware/auth';
import { User } from '../models';
import { IUser } from '../types';
import * as admin from 'firebase-admin';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      uid: string;
      email?: string;
    };
  }
}

async function routes(fastify: FastifyInstance) {
  // Signup route
  fastify.post('/signup', {
    schema: {
      description: 'Register a new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'name', 'firebaseToken'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          firebaseToken: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'User created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            firebaseUid: { type: 'string' }
          }
        },
        400: {
          description: 'User already exists',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, name, firebaseToken } = request.body as { 
        email: string; 
        name: string;
        firebaseToken: string;
      };
      
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { firebaseUid: decodedToken.uid } });
      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      // Create new user
      const user = await User.create({ 
        email, 
        name,
        firebaseUid: decodedToken.uid 
      });
      
      return reply.code(201).send(user);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Login route
  fastify.post('/login', {
    schema: {
      description: 'Login user with Firebase token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['firebaseToken'],
        properties: {
          firebaseToken: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                name: { type: 'string' },
                firebaseUid: { type: 'string' }
              }
            }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { firebaseToken } = request.body as { firebaseToken: string };
      
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      // Get user from database
      const user = await User.findOne({ where: { firebaseUid: decodedToken.uid } });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.send({ user });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get current user
  fastify.get('/me', {
    schema: {
      description: 'Get current user information',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'User information',
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            firebaseUid: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { firebaseUid: request.user.uid } });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      return reply.send(user);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default routes; 