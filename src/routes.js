const express = require('express');
const authMiddleware = require('./app/middlewares/auth');
const UserController = require('./app/controllers/UserController');

const routes = express.Router();

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.use(authMiddleware);

routes.get('/users', UserController.store);

module.exports = routes;
