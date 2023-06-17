require('express-async-errors');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const app = express();


logger.info('Connecting to db...');
mongoose.connect(config.MONGODB_URI).then(() => {
  logger.info('Connected to db!');
})
  .catch(err => {
    logger.error('Connection failed:', err);
  });

app.use(cors());
//app.use(build);
app.use(express.json());
app.use(middleware.tokenExtractor);
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);



module.exports = app;