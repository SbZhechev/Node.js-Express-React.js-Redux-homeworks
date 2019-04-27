const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8000;
const recipesHandler = require('./recipes.js');
const postsHandler = require('./posts.js');

app.set('app', __dirname + 'app');
app.use('/api/recipes', recipesHandler);
app.use('/api/posts', postsHandler);

app.get('/', (req, res) => {
    res.json('Welcome to the online Cooking Recipes Book');
});

app.use((req, res , next) => {
    res.status(405);
    const err = new Error('Page not found');
    next(err);
});

app.use((err, req, res) => {
    res.json(err);
});

const dburl = 'mongodb://localhost:27017/Cooking Recipes';

mongoClient.connect(dburl, {useNewUrlParser: true, w:1})
    .then(db => {
        app.locals.db = db.db('CookingRecipes');
        app.listen(PORT, err => {
            if(err) throw err;
            console.log(`App listening on port: ${PORT}`);
        });
    })
    .catch(err => {
        throw err;
    });