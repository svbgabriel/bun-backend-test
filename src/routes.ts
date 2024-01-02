import express from "express";
import UserController from "./app/controller/UserController";

const routes = express.Router();

routes.post("/users", UserController.store);
routes.put("/users", UserController.update);
routes.get("/users/:id", UserController.show);

export default routes;
