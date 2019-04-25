const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const path = require('path');

const PORT = process.env.PORT || 9000;
const app = express();

app.set('app', path.join(__dirname, 'app'));
app.use(bodyParser.json({limit: '20mb'}));

app.get('/', (req, res) => {
    res.json('Hello world!');
});

const projectsHandler = require('./projects.js');
app.use('/api/projects', projectsHandler);

app.use((req, res, nex) => {
    const err = new Error('Not found');
    err.status = 404;
    nex(err);
});

app.use((err, req, res) => {
    res.status = err.status || 500;
    res.json({
        message: err.message,
        error: err.error || err
    });
});


dburl = 'mongodb://localhost:27017/ProjectManagement';

mongoClient.connect(dburl, (err, db) => {
    if(err) throw err;
        app.locals.db = db.db('ProjectManagement');
        app.listen(PORT, (err) =>{
            if(err) throw err;
            console.log(`Projects Management on port ${PORT}`);
        });
});