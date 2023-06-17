const logger = require('./logger');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '');
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  if(request.token === null) {
    return response.status(401).json({ error: 'no token provided' });
  }
  const userToken = jwt.verify(request.token, process.env.SECRET);
  if(!userToken.id) {
    return response.status(401).json({ error: 'invalid token' });
  }
  request.user = await User.findById(userToken.id);
  next();
};


const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};


const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};