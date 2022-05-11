import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import { connect, disconnect } from './src/configs/db.config.js';

import indexRouter from './src/routes/index.routes.js';
import usersRouter from './src/routes/users.routes.js';

const app = express();

// Middlewares
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Connect database
connect();

// Disconnect database connection on server stop
process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

export default app;
