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

      return user;
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
      detail: {
        tags: ["Users"],
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

      return user;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        tags: ["Users"],
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

      return user;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      headers: t.Object({
        authentication: t.String(),
      }),
      detail: {
        tags: ["Users"],
      },
    }
  );
