const express = require('express');
const bodyParser = require('body-parser');
const indicative = require('indicative');

const router = express.Router();

router.use(bodyParser.json({limit: '20mb'}));

router.get('/', (req, res) => {
    const dataBase = req.app.locals.db;
    dataBase.collection('Recipes').find().toArray().then(recipes => {
        if(recipes.length > 0){
            res.json(recipes);
        } else {
            res.json('No data');
        }
    });
});

router.post('/', (req, res) => {
    const recipe = req.body;
    const dataBase = req.app.locals.db;
    indicative.validate(recipe, 
    {
        name: 'required|string|min:5',
        description: 'required|string|min:4',
        author: 'required|string|min:5',
        date: 'string|min:8'

    }).then(recipe => {
        dataBase.collection('Recipes').insertOne(recipe)
            .then(result => {
                if(result.result.ok && result.insertedCount === 1) {
                    const uri = req.baseUrl + '/' + recipe._id;
                    res.status(201);
                    res.location(uri);
                    res.json(recipe);
                }
            });
    }).catch(errors => {
        res.status(400);
        res.json(errors);
    });
});

module.exports = router;