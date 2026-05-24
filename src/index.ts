import { Elysia } from 'elysia'
import config from './config'
import './database/db.setup'
import openapi, { fromTypes } from '@elysia/openapi'
import { userController } from './controllers/user-controller'

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
      references: fromTypes(
        process.env.NODE_ENV === 'production' ? 'dist/index.d.ts' : 'src/index.ts',
      ),
      path: '/docs',
    }),
  )
  .use(userController)
  .listen(config.port)

export type App = typeof app
