import { describe, it, expect, jest } from "bun:test";
import { edenTreaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import { app } from "../../src/index";
import User from "../../src/models/User";

const server = new Elysia().use(app);

const api = edenTreaty<typeof server>("http://localhost:3000");

describe("test user controller", () => {
  it("should get 401 when get info without authentication", async () => {
    const user = { _id: "6597ff1e291b810814587e5b", token: "not a real value" };
    User.findById = jest.fn().mockResolvedValue(user);

    const { status, error } = await api.users["6597ff1e291b810814587e5b"].get({
      $headers: {
        authentication: "",
      },
    });

    expect(status).toBe(401);
    expect(error?.value.message).toBe("Não autorizado");
  });
  it("should get 404 when the user was not found", async () => {
    User.findById = jest.fn().mockResolvedValue(undefined);

    const { status, error } = await api.users["6597ff1e291b810814587e5b"].get({
      $headers: {
        authentication: "",
      },
    });

    expect(status).toBe(404);
    expect(error?.value.message).toBe("Usuário não encontrado");
  });
});
