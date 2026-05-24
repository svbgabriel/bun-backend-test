import { describe, it, expect, jest } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { subMinutes, addMinutes } from "date-fns";
import { app } from "../../src/index";
import User from "../../src/models/user";

const api = treaty(app)

describe("UserController Tests", () => {
  describe("GET /users/:id", () => {
    it("should return 401 when authentication header is missing or malformed", async () => {
      // Arrange
      const userId = "6597ff1e291b810814587e5b";
      const user = { _id: userId, token: "some-token" };
      User.findById = jest.fn().mockResolvedValue(user);

      // Act
      const { status, error } = await api.users({id: userId}).get({
        headers: { authentication: "" },
      });

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Not authorized");
    });

    it("should return 401 when token format is invalid (missing Bearer prefix)", async () => {
      // Arrange
      const userId = "6597ff1e291b810814587e5b";
      const user = { _id: userId, token: "some-token" };
      User.findById = jest.fn().mockResolvedValue(user);

      // Act
      const { status, error } = await api.users({id: userId}).get({
        headers: { authentication: "some-token" },
      });

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Not authorized");
    });

    it("should return 401 when token does not match user's token", async () => {
      // Arrange
      const userId = "6597ff1e291b810814587e5b";
      const user = { _id: userId, token: "correct-token" };
      User.findById = jest.fn().mockResolvedValue(user);

      // Act
      const { status, error } = await api.users({id: userId}).get({
        headers: { authentication: "Bearer wrong-token" },
      });

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Not authorized");
    });

    it("should return 404 when user is not found", async () => {
      // Arrange
      const userId = "nonexistent-id";
      User.findById = jest.fn().mockResolvedValue(undefined);

      // Act
      const { status, error } = await api.users({id: userId}).get({
        headers: { authentication: "Bearer some-token" },
      });

      // Assert
      expect(status).toBe(404);
      expect(error?.value.message).toBe("User not found");
    });

    it("should return 401 when session is expired (over 30 minutes)", async () => {
      // Arrange
      const userId = "6597ff1e291b810814587e5b";
      const user = {
        _id: userId,
        name: "User",
        email: "test@test.com",
        token: "valid-token",
        phones: [],
        lastLogin: subMinutes(new Date(), 31),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      User.findById = jest.fn().mockResolvedValue(user);

      // Act
      const { status, error } = await api.users({id: userId}).get({
        headers: { authentication: "Bearer valid-token" },
      });

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Invalid session");
    });

    it("should return 200 when all checks pass", async () => {
      // Arrange
      const userId = "6597ff1e291b810814587e5b";
      const user = {
        _id: userId,
        name: "User",
        email: "test@test.com",
        token: "valid-token",
        phones: [],
        lastLogin: addMinutes(new Date(), 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      User.findById = jest.fn().mockResolvedValue(user);

      // Act
      const { status, data } = await api.users({id: userId}).get({
        headers: { authentication: "Bearer valid-token" },
      });

      // Assert
      expect(status).toBe(200);
      expect(data?.id).toBe(userId);
    });
  });

  describe("POST /users", () => {
    it("should return 400 when email is already in use", async () => {
      // Arrange
      const requestData = {
        name: "User",
        email: "existing@test.com",
        password: "password123",
        phones: [],
      };
      User.findOne = jest.fn().mockResolvedValue({ email: "existing@test.com" });

      // Act
      const { status, error } = await api.users.post(requestData);

      // Assert
      expect(status).toBe(400);
      expect(error?.value.message).toBe("This e-mail is already in use");
    });

    it("should return 200 and create user when data is valid", async () => {
      // Arrange
      const requestData = {
        name: "New User",
        email: "new@test.com",
        password: "password123",
        phones: [],
      };
      const createdUser = {
        _id: "6597ff1e291b810814587e5b",
        name: requestData.name,
        email: requestData.email,
        token: "generated-token",
        phones: [],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      User.findOne = jest.fn().mockResolvedValue(undefined);
      User.create = jest.fn().mockResolvedValue(createdUser);
      User.generateToken = jest.fn().mockReturnValue("generated-token");

      // Act
      const { status, data } = await api.users.post(requestData);

      // Assert
      expect(status).toBe(200);
      expect(data?.id).toBe("6597ff1e291b810814587e5b");
      expect(data?.email).toBe(requestData.email);
    });
  });

  describe("PUT /users", () => {
    it("should return 401 when user is not found during login", async () => {
      // Arrange
      const loginData = { email: "nonexistent@test.com", password: "password" };
      User.findOne = jest.fn().mockResolvedValue(undefined);

      // Act
      const { status, error } = await api.users.put(loginData);

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Invalid username and/or password");
    });

    it("should return 401 when password does not match", async () => {
      // Arrange
      const loginData = { email: "test@test.com", password: "wrong-password" };
      const user = {
        _id: "id",
        email: "test@test.com",
        compareHash: async () => false,
      };
      User.findOne = jest.fn().mockResolvedValue(user);

      // Act
      const { status, error } = await api.users.put(loginData);

      // Assert
      expect(status).toBe(401);
      expect(error?.value.message).toBe("Invalid username and/or password");
    });

    it("should return 200 and update lastLogin/token on successful login", async () => {
      // Arrange
      const loginData = { email: "test@test.com", password: "correct-password" };
      const user = {
        _id: "6597ff1e291b810814587e5b",
        name: "Test User",
        email: "test@test.com",
        phones: [],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        compareHash: async () => true,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne = jest.fn().mockResolvedValue(user);
      User.generateToken = jest.fn().mockReturnValue("new-token");

      // Act
      const { status, data } = await api.users.put(loginData);

      // Assert
      expect(status).toBe(200);
      expect(data?.id).toBe("6597ff1e291b810814587e5b");
      expect(data?.token).toBe("new-token");
      expect(user.save).toHaveBeenCalled();
    });
  });
});
