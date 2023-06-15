const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    }  
  ]

beforeEach(async () => {
    await Blog.deleteMany({});
    await Promise.all(blogs.map(blog => (new Blog(blog)).save()));
}, 100000);


test('returns the correct amount of blogs in JSON', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
    
    expect(response.body).toHaveLength(blogs.length);
    
},100000);


test('verify that the unique identifier of each blog is named id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
    
    response.body.forEach(blog => expect(blog.id).toBeDefined());
    
},100000);


test('verify creation', async () => {
    const newBlog = {
      title: 'test',
      author: 'test',
      url: 'www.test.com',
      likes: 4
    }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual({...newBlog, id: response.body.id});

    const responseBlogs = (await api.get('/api/blogs')).body;

    expect(responseBlogs).toHaveLength(blogs.length + 1);
    expect(responseBlogs.find(blog => blog.id === response.body.id))
      .toEqual({...newBlog, id: response.body.id});

},100000);

test('verify likes', async () => {
  const newBlog = {
    title: 'test',
    author: 'test',
    url: 'www.test.com',
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual({...newBlog, id: response.body.id, likes: 0 });

},100000);


test('verify url or title missing', async () => {
  const urlLessBlog = {
    title: 'test',
    author: 'test',
  }
  const titleLessBlog = {
    url: 'www.test.com',
    author: 'test',
  }
  const authorBlog = {
    author: 'test',
  }

  await api.post('/api/blogs').send(titleLessBlog).expect(400);
  await api.post('/api/blogs').send(urlLessBlog).expect(400);
  await api.post('/api/blogs').send(authorBlog).expect(400);
  
},100000);

afterAll(async () => {
  await mongoose.connection.close();
});