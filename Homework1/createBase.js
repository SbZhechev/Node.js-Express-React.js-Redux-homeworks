const mongoClient = require('mongodb').MongoClient;
const dburl = 'mongodb://localhost:27017/CookingRecipes';

mongoClient.connect(dburl,{useNewUrlParser: true, w:1})
    .then(db => {
        console.log('Database created');
        db.db('CookingRecipes').createCollection('Recipes', err => {
            if(err) throw err;
            console.log('Collection created!');
            db.close();
        });
    })
    .catch(err => {
        throw err;
    });