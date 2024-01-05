import { Elysia, t } from "elysia";
import { addMinutes, isBefore } from "date-fns";
import User from "../models/User";

export const userController = new Elysia({ prefix: "/users" })
  .post(
    "/",
    async ({ body, set }) => {
      const { email } = body;

      if (await User.findOne({ email })) {
        set.status = 400;
        throw { message: "E-mail já existente" };
      }

      const token = User.generateToken(email);

      const user = await User.create({ ...body, token });

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phones: user.phones,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        token,
      };
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
          })
        ),
      }),
      response: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String(),
        phones: t.Array(
          t.Object({
            number: t.String(),
            code: t.String(),
          })
        ),
        createdAt: t.String(),
        updatedAt: t.String(),
        lastLogin: t.String(),
        token: t.String(),
      }),
      detail: {
        tags: ["Users"],
        summary: "Creates a new user",
      },
    }
  )
  .put(
    "/",
    async ({ body, set }) => {
      const { email, password } = body;

      const user = await User.findOne({ email });

      if (!user) {
        set.status = 401;
        throw { message: "Usuário e/ou senha inválidos" };
      }

      if (!(await user.compareHash(password))) {
        set.status = 401;
        throw { message: "Usuário e/ou senha inválidos" };
      }

      const token = User.generateToken(email);
      user.lastLogin = new Date();
      user.token = token;

      await user.save();

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phones: user.phones,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        token,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String(),
        phones: t.Array(
          t.Object({
            number: t.String(),
            code: t.String(),
          })
        ),
        createdAt: t.String(),
        updatedAt: t.String(),
        lastLogin: t.String(),
        token: t.String(),
      }),
      detail: {
        tags: ["Users"],
        summary: "Update the token of a user",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, headers: { authentication }, set }) => {
      if (!authentication) {
        set.status = 401;
        throw { message: "Não autorizado" };
      }

      const user = await User.findById(id);

      if (!user) {
        set.status = 400;
        throw { message: "Usuário não encontrado" };
      }

      const [, token] = authentication.split(" ");

      if (user.token !== token) {
        set.status = 401;
        throw { message: "Não autorizado" };
      }

      if (isBefore(addMinutes(user.lastLogin, 30), Date.now())) {
        set.status = 401;
        throw { message: "Sessão inválida" };
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
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      headers: t.Object({
        authentication: t.String(),
      }),
      response: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String(),
        phones: t.Array(
          t.Object({
            number: t.String(),
            code: t.String(),
          })
        ),
        createdAt: t.String(),
        updatedAt: t.String(),
        lastLogin: t.String(),
        token: t.String(),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get the info about a user",
      },
    }
  );
