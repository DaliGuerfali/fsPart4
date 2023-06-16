const User = require('../models/user');
const Blog = require('../models/blog');

const blogs = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0,
      user: '648ca3e83a2b3c9fa68cff11'
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
      user: '648ca3fafb4eba0a849eda9b'
    },
    {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
      user: '648ca3fafb4eba0a849eda9b'
    },
    {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      __v: 0,
      user: '648ca4067ba7ddcc2033a9de'
    },
    {
      _id: '5a422ba71b54a676234d17fb',
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      __v: 0,
      user: '648ca4067ba7ddcc2033a9de'
    },
    {
      _id: '5a422bc61b54a676234d17fc',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0,
      user: '648ca40c19b6bb1e1444de8e'
    }
];

const users = [
    {
      _id: '648ca3e83a2b3c9fa68cff11',
      username: 'Mike',
      name: 'Michael Chan',
      passwordHash: '3qsd35s651qsd3131sq651qds',
      blogs: [
        '5a422a851b54a676234d17f7'
      ]
    },
    {
      _id: '648ca3fafb4eba0a849eda9b',
      username: 'Ed265',
      name: 'Edsger W. Dijkstra',
      passwordHash: '3qsd35s651qsd3131sq651qds',
      blogs: [
        '5a422aa71b54a676234d17f8',
        '5a422b3a1b54a676234d17f9'
      ]
    },
    {
      _id: '648ca4016ee4751971b230f2',
      username: 'edsger310',
      name: 'Edsger W. Dijkstra',
      passwordHash: '3qsd35s651qsd3131sq651qds',
    },
    {
      _id: '648ca4067ba7ddcc2033a9de',
      username: 'robby',
      name: 'Robert C. Martin',
      passwordHash: '3qsd35s651qsd3131sq651qds',
      blogs: [
        '5a422b891b54a676234d17fa',
        '5a422ba71b54a676234d17fb'
      ]
    },
    {
      _id: '648ca40c19b6bb1e1444de8e',
      username: 'marbo',
      name: 'Robert C. Martin',
      passwordHash: '3qsd35s651qsd3131sq651qds',
      blogs: [
        '5a422bc61b54a676234d17fc'
      ]
    },
    {
      _id: '648ca4107383e9dfc215c93a',
      username: 'rob2010',
      name: 'Robert C. Martin',
      passwordHash: '3qsd35s651qsd3131sq651qds',
    }
];

const initDb = async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  await Promise.all(users.map(user => (new User(user)).save()));
  await Promise.all(blogs.map(blog => (new Blog(blog)).save()));
}


module.exports = {
    blogs,
    users,
    initDb
}