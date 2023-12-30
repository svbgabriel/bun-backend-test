import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import config from './config';
import routes from './routes';

dotenv.config();

const server = express();
server.use(express.json());
server.use(routes);

mongoose.connect(config.databaseUri);

export default server;
