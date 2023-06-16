const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./testHelper');
const jwt = require('jsonwebtoken');

const api = supertest(app);

beforeEach(helper.initDb, 100000);


describe('when logging in', () => {
    test('succeed with 200 if credentials correct and return token', async () => {
        const user = helper.users[1];
        const response = await api
          .post('/api/login')
          .send({ username: user.username, password: user.username })
          .expect(200);

        const { token, name } = response.body;
        const decodedToken = jwt.verify(token , process.env.SECRET);
        expect(name).toBe(user.name);
        expect(decodedToken.id).toBe(user._id);
        expect(decodedToken.username).toBe(user.username);

    }, 100000);

    test('fails with 401 if credentials incorrect', async () => {
        const notInDb = {
            username: 'notInDb',
            password: 'notInDb'
        }

        const notMike = {
            username: 'Mike',
            password: 'notMike'
        }

        await api
          .post('/api/login')
          .send(notInDb)
          .expect(401);
        
          await api
          .post('/api/login')
          .send(notMike)
          .expect(401);
    }, 100000);
});


afterAll(async () => {
    await mongoose.connection.close();
  });
