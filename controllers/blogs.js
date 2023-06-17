const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' });
  }

  
  const user = await User.findById(decodedToken.id);
  const blog = new Blog({...body, user: user.id });
  const result = await blog.save();
  user.blogs.push(blog.id);
  await user.save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const result = await Blog.findByIdAndUpdate(request.params.id,
    { ...request.body },
    { new: true, runValidators: true, context: 'query' });
  response.status(200).json(result);
});


module.exports = blogsRouter;