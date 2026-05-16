import { describe, it, expect, spyOn, jest, afterEach } from "bun:test";
import User from "../../src/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../src/config";

describe("User Model", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("compareHash", () => {
    it("should return true when password matches", async () => {
      // Arrange
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
        token: "someToken",
      });
      spyOn(bcrypt, "compare").mockImplementation(async () => true);

      // Act
      const result = await user.compareHash("plainPassword");

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith("plainPassword", "hashedPassword");
    });

    it("should return false when password does not match", async () => {
      // Arrange
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
        token: "someToken",
      });
      spyOn(bcrypt, "compare").mockImplementation(async () => false);

      // Act
      const result = await user.compareHash("wrongPassword");

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith("wrongPassword", "hashedPassword");
    });
  });

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      // Arrange
      const email = "test@example.com";
      const expectedToken = "signedToken";
      spyOn(jwt, "sign").mockImplementation(() => expectedToken as any);

      // Act
      const token = User.generateToken(email);

      // Assert
      expect(token).toBe(expectedToken);
      expect(jwt.sign).toHaveBeenCalledWith({ payload: email }, config.secret, {
        expiresIn: config.ttl,
      });
    });
  });

  describe("Hooks", () => {
    it("should hash the password when it is modified", async () => {
      // Accessing the schema hook directly to test logic without a database
      // @ts-ignore
      const preSaveHooks = User.schema.s.hooks._pres.get("save");
      const hashHook = preSaveHooks.find((h: any) => h.fn.toString().includes("bcrypt.hash"));

      if (!hashHook) {
        throw new Error("Could not find hash hook");
      }

      const user = {
        password: "plainPassword",
        isModified: (path: string) => path === "password",
      } as any;

      const next = () => {};
      spyOn(bcrypt, "hash").mockImplementation(async () => "hashedPassword");

      await hashHook.fn.call(user, next);

      expect(user.password).toBe("hashedPassword");
      expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword", 8);
    });

    it("should not hash the password when it is not modified", async () => {
      // @ts-ignore
      const preSaveHooks = User.schema.s.hooks._pres.get("save");
      const hashHook = preSaveHooks.find((h: any) => h.fn.toString().includes("bcrypt.hash"));

      const user = {
        password: "alreadyHashed",
        isModified: (path: string) => false,
      } as any;

      const next = () => {};
      spyOn(bcrypt, "hash");

      await hashHook.fn.call(user, next);

      expect(user.password).toBe("alreadyHashed");
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

});
