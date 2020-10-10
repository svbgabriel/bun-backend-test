const express = require('express');
const UserController = require('./app/controllers/UserController');

const routes = express.Router();

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.get('/users/:id', UserController.show);

module.exports = routes;
