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

describe("test create user", () => {
  it("should get 400 when email is already used", async () => {
    const user = {
      name: "User",
      email: "test@test.com",
      password: "",
      token: "notarealvalue",
      phones: [],
    };

    User.findOne = jest.fn().mockResolvedValue(user);

    const { status, error } = await api.users[""].post({
      name: "User",
      email: "test@test.com",
      password: "",
      phones: [],
    });

    expect(status).toBe(400);
    expect(error?.value.message).toBe("E-mail já existente");
  });
  it("should get 200 when all checks are ok", async () => {
    process.env.SECRET = "SOME_RANDOM_SECRET";
    process.env.TTL = "1800";

    const request = {
      name: "User",
      email: "test@test.com",
      password: "notreal",
      phones: [],
    };

    const createdUser = {
      _id: "6597ff1e291b810814587e5b",
      name: "User",
      email: "test@test.com",
      token: "notarealvalue",
      phones: [],
      lastLogin: parseJSON(formatISO(Date.now())),
      createdAt: parseJSON(formatISO(Date.now())),
      updatedAt: parseJSON(formatISO(Date.now())),
    };

    User.findOne = jest.fn().mockResolvedValue(undefined);
    User.create = jest.fn().mockResolvedValue(createdUser);

    const { status, data } = await api.users[""].post(request);

    expect(status).toBe(200);
    expect(data?.id).toBe("6597ff1e291b810814587e5b");
  });
});
describe("test update user", () => {
  it("should get 401 when user is not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(undefined);

    const { status, error } = await api.users[""].put({
      email: "test@test.com",
      password: "",
    });

    expect(status).toBe(401);
    expect(error?.value.message).toBe("Usuário e/ou senha inválidos");
  });
  it("should get 401 if password does not match", async () => {
    const user = {
      _id: "6597ff1e291b810814587e5b",
      name: "User",
      email: "test@test.com",
      password: "otherValue",
      token: "notarealvalue",
      phones: [],
      lastLogin: addMinutes(Date.now(), 31),
      createdAt: parseJSON(formatISO(Date.now())),
      updatedAt: parseJSON(formatISO(Date.now())),
      compareHash: () => false,
    };

    User.findOne = jest.fn().mockResolvedValue(user);

    const { status, error } = await api.users[""].put({
      email: "test@test.com",
      password: "random",
    });

    expect(status).toBe(401);
    expect(error?.value.message).toBe("Usuário e/ou senha inválidos");
  });
  it("should get 200 when all checks are ok", async () => {
    const user = {
      _id: "6597ff1e291b810814587e5b",
      name: "User",
      email: "test@test.com",
      password: "otherValue",
      token: "notarealvalue",
      phones: [],
      lastLogin: parseJSON(formatISO(Date.now())),
      createdAt: parseJSON(formatISO(Date.now())),
      updatedAt: parseJSON(formatISO(Date.now())),
      compareHash: () => true,
      save: () => {},
    };

    User.findOne = jest.fn().mockResolvedValue(user);

    const { status, data } = await api.users[""].put({
      email: "test@test.com",
      password: "random",
    });

    expect(status).toBe(200);
    expect(data?.id).toBe("6597ff1e291b810814587e5b");
  });
});
