import { Elysia, t } from 'elysia'
import { addMinutes, isBefore } from 'date-fns'
import User from '../models/user'

export const userController = new Elysia({ prefix: '/users' })
  .model({
    createUserResponse: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      phones: t.Array(
        t.Object({
          number: t.String(),
          code: t.String(),
        }),
      ),
      createdAt: t.String(),
      updatedAt: t.String(),
      lastLogin: t.String(),
      token: t.String(),
    }),
    getUserResponse: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      phones: t.Array(
        t.Object({
          number: t.String(),
          code: t.String(),
        }),
      ),
      createdAt: t.String(),
      updatedAt: t.String(),
      lastLogin: t.String(),
      token: t.String(),
    }),
    updateUserResponse: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      phones: t.Array(
        t.Object({
          number: t.String(),
          code: t.String(),
        }),
      ),
      createdAt: t.String(),
      updatedAt: t.String(),
      lastLogin: t.String(),
      token: t.String(),
    }),
    error: t.Object({
      message: t.String(),
    }),
  })
  .post(
    '/',
    async ({ body, status }) => {
      const { email } = body

      if (await User.findOne({ email })) {
        return status(400, { message: 'This e-mail is already in use' })
      }

      const token = User.generateToken(email)

      const user = await User.create({ ...body, token })

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phones: user.phones,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        token,
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        phones: t.Array(
          t.Object({
            number: t.String(),
            code: t.String(),
          }),
        ),
      }),
      response: {
        200: 'createUserResponse',
        400: 'error',
      },
      detail: {
        tags: ['Users'],
        summary: 'Creates a new user',
      },
    },
  )
  .put(
    '/',
    async ({ body, status }) => {
      const { email, password } = body

      const user = await User.findOne({ email })

      if (!user) {
        return status(401, { message: 'Invalid username and/or password' })
      }

      if (!(await user.compareHash(password))) {
        return status(401, { message: 'Invalid username and/or password' })
      }

      const token = User.generateToken(email)
      user.lastLogin = new Date()
      user.token = token

      await user.save()

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phones: user.phones,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        token,
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: {
        200: 'updateUserResponse',
        401: 'error',
      },
      detail: {
        tags: ['Users'],
        summary: 'Update the token of a user',
      },
    },
  )
  .get(
    '/:id',
    async ({ params: { id }, headers: { authentication }, status }) => {
      const user = await User.findById(id)

      if (!user) {
        return status(404, { message: 'User not found' })
      }

      const parts = authentication.split(' ')

      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return status(401, { message: 'Not authorized' })
      }

      const token = parts[1]

      if (user.token !== token) {
        return status(401, { message: 'Not authorized' })
      }

      if (isBefore(addMinutes(user.lastLogin, 30), Date.now())) {
        return status(401, { message: 'Invalid session' })
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phones: user.phones,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        token,
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      headers: t.Object({
        authentication: t.String(),
      }),
      response: {
        200: 'getUserResponse',
        400: 'error',
        401: 'error',
        404: 'error',
      },
      detail: {
        tags: ['Users'],
        summary: 'Get the info about a user',
      },
    },
  )
