import { Elysia } from 'elysia'
import config from './config'
import './database/db.setup'
import { userController } from './controllers/user-controller'
import openapi, { fromTypes } from '@elysia/openapi'

export const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: 'User API',
          version: '1.0.0',
          description: 'Documentation for this bun test using Elysia',
        },
        tags: [
          {
            name: 'Users',
            description: 'General endpoints for managing users',
          },
        ],
      },
      references: fromTypes(),
    }),
  )
  .use(userController)
  .listen(config.port)
