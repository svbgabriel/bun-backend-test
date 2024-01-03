import type { Request, Response } from "express";
import { store, update, show } from "../service/user-service";

export class UserController {
  public async store(req: Request, res: Response) {
    return store(req, res);
  }

  public async update(req: Request, res: Response) {
    return update(req, res);
  }

  public async show(req: Request, res: Response) {
    return show(req, res);
  }
}

export default new UserController();
