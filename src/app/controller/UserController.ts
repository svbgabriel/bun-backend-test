import { addMinutes, isBefore } from "date-fns";
import type { Request, Response } from "express";
import User from "../model/User";

class UserController {
  async store(req: Request, res: Response) {
    const { email } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ mensagem: "E-mail já existente" });
    }

    const token = User.generateToken(email);

    const user = await User.create({ ...req.body, token });

    return res.json(user);
  }

  async update(req: Request, res: Response) {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ mensagem: "Usuário e/ou senha inválidos" });
    }

    if (!(await user.compareHash(senha))) {
      return res.status(401).json({ mensagem: "Usuário e/ou senha inválidos" });
    }

    const token = User.generateToken(email);
    user.ultimo_login = new Date();
    user.token = token;

    await user.save();

    return res.json(user);
  }

  async show(req: Request, res: Response) {
    const headers = req.headers;

    let authHeader: string | undefined;
    if (!headers.authentication) {
      authHeader = undefined;
    } else if (Array.isArray(authHeader)) {
      authHeader = headers.authentication[0];
    } else {
      authHeader = headers.authentication as string;
    }

    if (!authHeader) {
      return res.status(401).json({ mensagem: "Não autorizado" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({ mensagem: "Usuário não encontrado" });
    }

    const [, token] = authHeader.split(" ");

    if (user.token !== token) {
      return res.status(401).json({ mensagem: "Não autorizado" });
    }

    if (isBefore(addMinutes(user.ultimo_login, 30), Date.now())) {
      return res.status(401).json({ mensagem: "Sessão inválida" });
    }

    return res.json(user);
  }
}

export default new UserController();
