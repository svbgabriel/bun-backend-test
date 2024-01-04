import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import mongoose from "mongoose";
import config from "./config";
import { userController } from "./controllers/user-controller";

mongoose.connect(config.databaseUri, {
  dbName: "bun-test",
});

export const server = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "User API",
          version: "1.0.0",
          description: "Documentation for this bun test using Elysia",
        },
        tags: [
          {
            name: "Users",
            description: "General endpoints for managing users",
          },
        ],
      },
    })
  )
  .use(userController)
  .listen(config.port);
