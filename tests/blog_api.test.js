const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./testHelper');


const api = supertest(app);



beforeEach(helper.initDb, 100000);


describe('when fetching blogs from database', () => {
  test('returns the correct amount of blogs in JSON', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(helper.blogs.length);
  },100000);


  test('verify that the unique identifier of each blog is named id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    response.body.forEach(blog => expect(blog.id).toBeDefined());

  },100000);
});

describe('when creating blog posts', () => {
  test('verify post creation is correct', async () => {
    const newBlog = {
      title: 'test',
      author: 'test',
      url: 'www.test.com',
      likes: 4
    };
    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${helper.testToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const body = response.body;
    expect(body).toEqual({ ...newBlog, id: body.id, user: helper.users[0]._id });

    const responseBlogs = (await api.get('/api/blogs')).body;

    expect(responseBlogs).toHaveLength(helper.blogs.length + 1);
    expect(responseBlogs.find(blog => blog.id === response.body.id))
      .toEqual({ 
        ...newBlog, 
        id: body.id, 
        user: { 
        id: helper.users[0]._id,
        username: helper.users[0].username,
        name: helper.users[0].name, 
    }});
    const user = await User.findById(helper.users[0]._id);
    expect(user.blogs.map(u => u.toJSON())).toContain(body.id);

  },100000);

  test('verify that likes default to 0 if not sent', async () => {
    const newBlog = {
      title: 'test',
      author: 'test',
      url: 'www.test.com',
    };
    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${helper.testToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual({ ...newBlog, id: response.body.id, likes: 0, user: helper.users[0]._id });

  },100000);

  test('return status 400 when url or title missing', async () => {
    const urlLessBlog = {
      title: 'test',
      author: 'test',
    };
    const titleLessBlog = {
      url: 'www.test.com',
      author: 'test',
    };
    const authorBlog = {
      author: 'test',
    };

    await api
    .post('/api/blogs')
    .set('authorization', `Bearer ${helper.testToken}`)
    .send(titleLessBlog)
    .expect(400);
    await api
    .post('/api/blogs')
    .set('authorization', `Bearer ${helper.testToken}`)
    .send(urlLessBlog)
    .expect(400);
    await api
    .post('/api/blogs')
    .set('authorization', `Bearer ${helper.testToken}`)
    .send(authorBlog)
    .expect(400);

  },100000);
});

describe('when deleting blog posts', () => {
  test('verify that a blog is deleted', async () => {
    const id = '5a422bc61b54a676234d17fc';
    await api
      .delete(`/api/blogs/${id}`)
      .expect(204);

    const blogsInDb = await Blog.find({});
    expect(blogsInDb).toHaveLength(helper.blogs.length - 1);
    expect(blogsInDb.map(blog => blog.id)).not.toContain(id);
  });

  test('fails with 400 when id is malformatted', async () => {
    const id = '5a422bc61b54a676234d17fy';

    await api
      .delete(`/api/blogs/${id}`)
      .expect(400);
  });

});


describe('when updating blog posts', () => {
  test('verify updating works as intended', async() => {
    const blogToUpdate = helper.blogs[0];
    const updatedBlog = (await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send({
        likes: 2,
        author: 'updatedAuthor',
        title: 'updatedTitle',
        url: 'updatedUrl',
      })
      .expect(200)).body;
    expect(updatedBlog).toEqual({
      id: blogToUpdate._id,
      likes: 2,
      author: 'updatedAuthor',
      title: 'updatedTitle',
      url: 'updatedUrl',
    });
  });

  test('fails with 400 when id is malformatted', async () => {
    const id = '5a422bc61b54a676234d17fy';

    await api
      .put(`/api/blogs/${id}`)
      .send({})
      .expect(400);
  });

  test('verify updating works as with empty object', async() => {
    const blogToUpdate = helper.blogs[0];
    const updatedBlog = (await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send({})
      .expect(200)).body;
    expect(updatedBlog).toEqual({
      id: blogToUpdate._id,
      likes: blogToUpdate.likes,
      author: blogToUpdate.author,
      title: blogToUpdate.title,
      url: blogToUpdate.url,
    });
  });
});


afterAll(async () => {
  await mongoose.connection.close();
});