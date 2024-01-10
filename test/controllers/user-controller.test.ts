import { describe, it, expect, jest } from "bun:test";
import { edenTreaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import { subMinutes, formatISO, parseJSON, addMinutes } from "date-fns";
import { app } from "../../src/index";
import User from "../../src/models/User";

const server = new Elysia().use(app);

const api = edenTreaty<typeof server>("http://localhost:3000");

describe("test get user", () => {
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
  it("should get 401 when token is too old", async () => {
    const user = {
      _id: "6597ff1e291b810814587e5b",
      name: "User",
      email: "test@test.com",
      password: "",
      token: "notarealvalue",
      phones: [],
      lastLogin: subMinutes(Date.now(), 31),
      createdAt: parseJSON(formatISO(Date.now())),
      updatedAt: parseJSON(formatISO(Date.now())),
    };

    User.findById = jest.fn().mockResolvedValue(user);

    const { status, error } = await api.users["6597ff1e291b810814587e5b"].get({
      $headers: {
        authentication: "Bearer notarealvalue",
      },
    });

    expect(status).toBe(401);
    expect(error?.value.message).toBe("Sessão inválida");
  });
  it("should get 200 when all checks are ok", async () => {
    const user = {
      _id: "6597ff1e291b810814587e5b",
      name: "User",
      email: "test@test.com",
      password: "",
      token: "notarealvalue",
      phones: [],
      lastLogin: addMinutes(Date.now(), 31),
      createdAt: parseJSON(formatISO(Date.now())),
      updatedAt: parseJSON(formatISO(Date.now())),
    };

    User.findById = jest.fn().mockResolvedValue(user);

    const { status, data } = await api.users["6597ff1e291b810814587e5b"].get({
      $headers: {
        authentication: "Bearer notarealvalue",
      },
    });

    expect(status).toBe(200);
    expect(data?.id).toBe("6597ff1e291b810814587e5b");
  });
});
