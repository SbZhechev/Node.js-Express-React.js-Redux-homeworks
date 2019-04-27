const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const indicative = require('indicative');

const router = express.Router();


router.use(bodyParser.json({limit: '20mb'}));

router.get('/:postId', (req, res) => {
    const dataBase = req.app.locals.db;
    const searchId = new mongo.ObjectID(req.params.postId);
    dataBase.collection('Recipes').findOne({_id: searchId})
        .then(recipe => {
            if(recipe) {
                res.json(recipe);
            }
            else {
                res.status(500);
                res.json('Server error');
            };
        });
});

router.put('/:postId', (req, res) => {
    const dataBase = req.app.locals.db;
    const searchId = new mongo.ObjectID(req.params.postId);
    const updatedRecipe = req.body;
    indicative.validate(updatedRecipe, 
    {
        name: 'required|string|min:4',
        description: 'required|string|min:4',
        author: 'required|string|min:4',
        date: 'string|min:8'
    }).then(updatedRecipe => {
        const { name: newName, description: newDescription, author: newAuthor, date: newDate } = updatedRecipe;
        dataBase.collection('Recipes').updateOne({_id: searchId},
                {$set:{name: newName, description: newDescription, author: newAuthor, date: newDate}}, (err, result) =>{
                    if(err) {
                        res.status(500);
                        res.json('No such record');
                        throw err;
                    } else {
                        res.status(204);
                        res.json(result);
                    }
                });
    }).catch(errors => {
        res.status(400);
        res.json(errors);
    });
});

router.delete('/:postId', (req, res) => {
    const dataBase = req.app.locals.db;
    const searchId = new mongo.ObjectID(req.params.postId);
    dataBase.collection('Recipes').deleteOne({_id: searchId})
        .then(result => {
            if(result.result.ok && result.result.n === 1){
                res.status(204);
                res.json(result);
            }
            else {
                res.status(500);
                res.json('No such record.');
            };
        })
        .catch(err => {
            res.status(400);
            throw err;
        });
});



module.exports = router;