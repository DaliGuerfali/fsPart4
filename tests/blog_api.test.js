const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./testHelper');
const jwt = require('jsonwebtoken');


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
        } });
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

  test('fails with 401 if token not provided', async () => {
    const newBlog = {
      title: 'test',
      author: 'test',
      url: 'www.test.com',
      likes: 4
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);
  },100000);
});

describe('when deleting blog posts', () => {
  test('verify that a blog is deleted when authenticated', async () => {
    const id = '5a422a851b54a676234d17f7';
    await api
      .delete(`/api/blogs/${id}`)
      .set('authorization', `Bearer ${helper.testToken}`)
      .expect(204);

    const blogsInDb = (await api.get('/api/blogs')).body;
    expect(blogsInDb).toHaveLength(helper.blogs.length - 1);
    expect(blogsInDb.map(blog => blog.id)).not.toContain(id);

    const decodedToken = jwt.verify(helper.testToken, process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    expect(user.blogs.map(u => u.toJSON())).not.toContain(id);
  }, 100000);

  test('fails with 400 when id is malformatted or jwt is invalid', async () => {
    const id1 = '5a422bc61b54a676234d17fy';

    await api
      .delete(`/api/blogs/${id1}`)
      .set('authorization', `Bearer ${helper.testToken}`)
      .expect(400);

    const id2 = '5a422a851b54a676234d17f7';

    await api
      .delete(`/api/blogs/${id2}`)
      .set('authorization', 'Bearer qsdlkjqsdjkbqdskjqdsf')
      .expect(400);
  }, 100000);

  test('fails with 401 if token is invalid or missing', async () => {
    const id = '5a422aa71b54a676234d17f8';
    await api
      .delete(`/api/blogs/${id}`)
      .set('authorization', `Bearer ${helper.testToken}`)
      .expect(401);

    const invalidToken = jwt.sign({ username: 'Mike' }, process.env.SECRET);

    await api
      .delete(`/api/blogs/${id}`)
      .set('authorization', `Bearer ${invalidToken}`)
      .expect(401);

    const blogsInDb = (await api.get('/api/blogs')).body;
    expect(blogsInDb).toHaveLength(helper.blogs.length);
    expect(blogsInDb.map(blog => blog.id)).toContain(id);
  }, 100000);
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
      user: helper.blogs[0].user
    });
  });

  test('fails with 400 when id is malformatted', async () => {
    const id = '5a422bc61b54a676234d17fy';

    await api
      .put(`/api/blogs/${id}`)
      .send({})
      .expect(400);
  });

  test('verify updating works with empty object', async() => {
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
      user: helper.blogs[0].user
    });
  });
});


afterAll(async () => {
  await mongoose.connection.close();
});