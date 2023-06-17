const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body;

  const blog = new Blog({...body, user: request.user.id });
  const result = await blog.save();
  request.user.blogs.push(blog.id);
  await request.user.save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  
  if(request.user.id !== blog.user.toString()) {
    return response.status(401).json({ error: 'invalid token' });
  }

  request.user.blogs = request.user.blogs.filter(b => b.toJSON() !== blog.id);
  await request.user.save();
  await Blog.findByIdAndRemove(blog.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const result = await Blog.findByIdAndUpdate(request.params.id,
    { ...request.body },
    { new: true, runValidators: true, context: 'query' });
  response.status(200).json(result);
});


module.exports = blogsRouter;