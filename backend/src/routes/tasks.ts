import { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../middleware/auth';
import { Task, User } from '../models';
import { ICreateTaskRequest, IUpdateTaskRequest, ITask } from '../types';

interface TaskParams {
  id: number;
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      description: 'Get all tasks for the current user',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          filter: { type: 'string', enum: ['all', 'my'] }
        }
      },
      response: {
        200: {
          description: 'List of tasks',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              createdBy: { type: 'number' },
              creator: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    preHandler: authenticate
  }, async (request: FastifyRequest<{ Querystring: { filter?: 'all' | 'my' } }>, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ where: { firebaseUid: request.user.uid } });
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const filter = request.query.filter || 'my';
      const whereClause = filter === 'my' ? { createdBy: user.id } : {};

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['email', 'name']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return reply.send(tasks);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/', {
    schema: {
      description: 'Create a new task',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Task created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            createdBy: { type: 'number' }
          }
        }
      }
    },
    preHandler: authenticate
  }, async (request: FastifyRequest, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { title, description, dueDate, status } = request.body as ICreateTaskRequest;
      const user = await User.findOne({ where: { firebaseUid: request.user.uid } });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const taskData = {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: user.id,
        status: status || 'pending'
      };

      const task = await Task.create(taskData);
      
      return reply.code(201).send(task);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get a specific task
  fastify.get<{ Params: TaskParams }>('/:id', {
    schema: {
      description: 'Get a specific task by ID',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Task details',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            createdBy: { type: 'number' },
            creator: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        404: {
          description: 'Task not found',
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
      const task = await Task.findByPk(request.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['email', 'name']
          }
        ]
      });

      if (!task) {
        return reply.code(404).send({ error: 'Task not found' });
      }
      return reply.send(task);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update a task
  fastify.put<{ Params: TaskParams }>('/:id', {
    schema: {
      description: 'Update a task',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Task updated successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            createdBy: { type: 'number' },
            creator: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        404: {
          description: 'Task not found',
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
      const { title, description, dueDate, status } = request.body as IUpdateTaskRequest;
      
      const [updated] = await Task.update(
        { title, description, dueDate, status },
        { where: { id: request.params.id }, returning: true }
      );
      
      if (!updated) {
        return reply.code(404).send({ error: 'Task not found' });
      }
      
      const task = await Task.findByPk(request.params.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['email', 'name']
          }
        ]
      });
      
      return reply.send(task);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete a task
  fastify.delete<{ Params: TaskParams }>('/:id', {
    schema: {
      description: 'Delete a task',
      tags: ['tasks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          description: 'Task deleted successfully',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        404: {
          description: 'Task not found',
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
      const deleted = await Task.destroy({ where: { id: request.params.id } });
      if (!deleted) {
        return reply.code(404).send({ error: 'Task not found' });
      }
      return reply.send({ message: 'Task deleted successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default routes; 