const mongoClient = require('mongodb').MongoClient;

dburl = 'mongodb://localhost:27017/Cooking';
mongoClient.connect(dburl, {useNewUrlParser: true})
    .then(db => {
        db.db('Cooking').createCollection('users', err => {
            if(err) throw err;
            console.log('Collection created');
            db.close();
        });
        db.db('Cooking').createCollection('recipes', err => {
            if(err) throw err;
            console.log('Collection created');
            db.close();
        })
    })
    .catch(err => {
        throw err;
    });