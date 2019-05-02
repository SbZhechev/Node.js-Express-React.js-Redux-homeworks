const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;

const app = express();
const PORT = process.env.PORT || 8000;

const usersHandler = require('./users.js');

app.use('/api/users', usersHandler);

app.use(bodyParser.json({limit: '20mb'}));

app.get('/', (req, res) => {
    res.json('Hello world!');
});

app.use((req, res ,next) => {
    res.status(404);
    const err = new Error('Page not found');
    next(err);
});

app.use((err, req, res) => {
    res.json(err);
});

const dburl = 'mongodb://localhost:27017/Cooking';

mongoClient.connect(dburl, {useNewUrlParser: true})
    .then(db => {
        app.locals.db = db.db('Cooking');
        app.listen(PORT, err => {
            if(err) throw err;
            console.log(`App listening on port: ${PORT}`);
        });
    })
    .catch(err =>{
        throw err;
    });