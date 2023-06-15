const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const blogsRouter = require('./controllers/blogs');

const app = express();


console.log('Connecting to db...');
mongoose.connect(config.MONGODB_URI).then(() => {
    console.log('Connected to db!');
})
.catch(err => {
    console.log('Connection failed:');
    console.log(err);
});

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogsRouter);



module.exports = app;