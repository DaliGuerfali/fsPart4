const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./testHelper');

const api = supertest(app);


beforeEach(helper.initDb, 100000);


describe('when fetching users from database', () => {
  test('returns the correct amount of users in JSON', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(helper.users.length);

  },100000);


  test('verify that the unique identifier of each user is named id and no passwordHash returns', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    response.body.forEach(user => {
        expect(user.id).toBeDefined();
        expect(user.passwordHash).not.toBeDefined();
    });


  },100000);
});

describe('when creating users', () => {

  test('verify user creation is correct when data is correct', async () => {
    const newUser = {
      username: 'testUsername',
      //name: 'testName',
      password: 'testHash',
    };
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual({ 
        username: newUser.username,
        //name: newUser.name,
        id: response.body.id,
        blogs: []
        });

    const responseUsers = (await api.get('/api/users')).body;

    expect(responseUsers).toHaveLength(helper.users.length + 1);
    expect(responseUsers.find(user => user.id === response.body.id))
      .toEqual({
        username: newUser.username,
        //name: newUser.name,
        id: response.body.id,
        blogs: []
      });

  },100000);
  test('fails with 400 if username or password length shorter than 3', async () => {
    const newUser1 = {
      username: 'shortPassword',
      name: 'testName',
      password: 'te',
    };
    const response1 = await api
      .post('/api/users')
      .send(newUser1)
      .expect(400);
    expect(response1.body.error).toBe('password should have at least 3 characters');
    const newUser2 = {
      username: 't',
      name: 'shorUsername',
      password: 'teqsdfqsdf',
    };
    await api
      .post('/api/users')
      .send(newUser2)
      .expect(400);

    const responseUsers = await User.find({});
    expect(responseUsers.map(user => user.username)).not.toContain(newUser1.username); 
    expect(responseUsers.map(user => user.name)).not.toContain(newUser2.name);

  },100000);
  test('fails with 400 if username or password are left out', async () => {
    const newUser1 = {
      username: 'noPassword',
      name: 'testName',
    };
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(400);
    
      const newUser2 = {
      name: 'noUsername',
      password: 'qsdfsdfsd'
    };
    await api
      .post('/api/users')
      .send(newUser2)
      .expect(400);

    const responseUsers = await User.find({});
    expect(responseUsers.map(user => user.username)).not.toContain(newUser1.username); 
    expect(responseUsers.map(user => user.name)).not.toContain(newUser2.name);

  },100000);
  test('fails with 400 if username is not unique', async () => {
    const newUser1 = {
      username: 'nonUnique',
      password: 'password',
    };
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(201);
    
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(400);
    
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(400);
  
    await api
      .post('/api/users')
      .send(newUser1)
      .expect(400);
    
    const responseUsers = await User.find({});
    expect(responseUsers.filter(user => user.username === newUser1.username)).toHaveLength(1); 
  },100000);
});


afterAll(async () => {
  await mongoose.connection.close();
});