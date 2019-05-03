const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const indicative = require('indicative');

const router = express.Router();

router.use(bodyParser.json({limit: '20mb'}));

router.get('/', (req, res) => {
    const dataBase = req.app.locals.db;
    dataBase.collection('users').find().toArray().then(users => {
        if(users.length > 0){
            res.json(users);
        } else {
            res.json('No data');
        };
    });
});

router.post('/', (req, res) => {
    const newUser = req.body;
    const dataBase = req.app.locals.db;
    indicative.validate(newUser, 
        {
            name: 'required|string',
            username: 'required|string|max:15',
            password: 'required|string|min:8',
            gender: 'string',
            accountType: 'required|string',
            picture: 'required|url',
            bio: 'string|max:512',
            accountStatus: 'required|string',
        })
        .then(newUser => {
            const date = new Date();
            newUser.registrationDate = `${date.getDate() - 2}.${date.getMonth()-1}.${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
            newUser.lastModified = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
            dataBase.collection('users').insertOne(newUser)
            .then(result => {
                    if(result.result.ok && result.insertedCount === 1){
                        const uri = req.baseUrl + '/' + newUser._id;
                        res.status(201);
                        res.location(uri);
                        res.json(newUser);
                    };
            })
            .catch(err =>{
                    res.status(500);
                    res.json(err.message);
                    throw err;
            });
        }).catch(errors => {
                res.status(400);
                res.json(errors);
        });
});

router.get('/:userId', (req, res) => {
    const dataBase = req.app.locals.db;
    var searchId = new mongodb.ObjectID(req.params.userId);
    dataBase.collection('users').findOne({_id:searchId})
        .then(user => {
            if(user){
                res.status(200);
                res.json(user);
            }
            else {
                res.status(500);
                res.json('No such record');
            };
        });
});

router.put('/:userId', (req, res) => {
    const dataBase = req.app.locals.db;
    const updatedUser = req.body;
    var searchId = new mongodb.ObjectID(req.params.userId);
    indicative.validate(updatedUser,
        {
            name: 'required|string',
            username: 'required|string|max:15',
            password: 'required|string|min:8',
            gender: 'string',
            accountType: 'required|string',
            picture: 'required|url',
            bio: 'string|max:512',
            accountStatus: 'required|string',
            registrationDate: 'date',
            lastModified: 'date'
        }).then(updatedUser => {
            const newlastModified = new Date();
            const { name: newName, 
                    username: newUserName, 
                    password: newPassword,
                    gender: newGender,
                    accountType: newAccountType,
                    picture: newPicture,
                    bio: newBio,
                    accountStatus: newAccountStatus } = updatedUser;
            dataBase.collection('users').updateOne({_id:searchId},
                {$set:{ name: newName, 
                    username: newUserName, 
                    password: newPassword,
                    gender: newGender,
                    accountType: newAccountType,
                    picture: newPicture,
                    bio: newBio,
                    accountStatus: newAccountStatus,
                    lastModified: `${newlastModified.getDate()}.${newlastModified.getMonth()+1}.${newlastModified.getFullYear()} ${newlastModified.getHours()}-${newlastModified.getMinutes()}-${newlastModified.getSeconds()}`}},
                    (err, result) => {
                        if(result.result.ok && result.n !== 0){
                            res.status(204);
                            res.json(result);
                        } else {
                            res.status(500);
                            res.json('No such record');
                        };
                    });
            })
            .catch(errors => {
                res.status(400);
                console.log(errors);
                res.json(errors);
             })
});

router.delete('/:userId', (req, res) => {
    const dataBase = req.app.locals.db;
    const searchId = new mongodb.ObjectID(req.params.userId);
    dataBase.collection('users').deleteOne({_id: searchId})
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
})

router.get('/:userId/recipes', (req, res) => {
    var dataBase = req.app.locals.db;
    var searchId = new mongodb.ObjectID(req.params.userId);
    dataBase.collection('recipes').find({postedBy: searchId}).toArray().then(recipes => {
        if(recipes.length > 0) {
            res.status(200);
            res.json(recipes);
        } else {
            res.status(400);
            res.json('No data');
        };
    }).catch(err => {
        res.status(500);
        res.json('Server error');
        throw err;
    })
});

router.post('/:userId/recipes', (req, res) => {
    var dataBase = req.app.locals.db;
    const date = new Date();
    const userId = new mongodb.ObjectID(req.params.userId);
    const newRecipe = req.body;
    indicative.validate(newRecipe, 
        {
            name: 'required|string|max:80',
            shortDescription: 'required|string|max:256',
            time: 'required|integer',
            products: 'required|array',
            picture: 'url',
            fullDescription: 'string|max:2048',
            keyWords: 'array',
        }).then(newRecipe => {
            newRecipe.postedBy = userId;
            newRecipe.postedOn = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${date.getHours()}hr-${date.getMinutes()}mn`;
            dataBase.collection('recipes').insertOne(newRecipe).then(result => {
                if(result.result.ok && result.insertedCount === 1){
                    const uri = req.baseUrl + req.url + '/' + newRecipe._id;
                    res.status(201);
                    res.location(uri);
                    res.json(newRecipe);
                } else {
                    res.status(500);
                    res.json('Server error');
                };
            });
        }).catch(errors => {
            res.status(400);
            res.json(errors);
        });
});

router.get('/:userId/recipes/:recipeId', (req, res) => {
    var dataBase = req.app.locals.db;
    var posterId = new mongodb.ObjectID(req.params.userId);
    var searchId = new mongodb.ObjectID(req.params.recipeId);
    dataBase.collection('recipes').find({postedBy: posterId, _id: searchId}).toArray().then(recipes=>{
        if(recipes.length > 0) {
            res.status(200);
            res.json(recipes);
        } else {
            res.status(400);
            res.json('No such record');
        };
    }).catch(err => {
        res.status(500);
        res.json('Server error');
    })
})

router.put('/:userId/recipes/:recipeId', (req, res) => {
    var dataBase = req.app.locals.db;
    var posterId = new mongodb.ObjectID(req.params.userId);
    var searchId = new mongodb.ObjectID(req.params.recipeId);
    const updatedRecipe = req.body;
    indicative.validate(updatedRecipe, 
        {
            name: 'required|string|max:80',
            shortDescription: 'required|string|max:256',
            time: 'required|integer',
            products: 'required|array',
            picture: 'url',
            fullDescription: 'string|max:2048',
            keyWords: 'array',
        }).then(updatedRecipe => {
            const {name, shortDescription, time, products, picture, fullDescription, keyWords} = updatedRecipe;
            const date = new Date();
            lastModified = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${date.getHours()}hr-${date.getMinutes()}mn`;
            updatedRecipe.lastModified = lastModified;
            dataBase.collection('recipes').updateOne({postedBy: posterId, _id: searchId},
                {$set:{name, shortDescription, time, products, picture, fullDescription, keyWords ,lastModified}})
                .then(result => {
                    if(result.result.ok && result.n !== 0){
                        res.status(204);
                        res.json(result);
                    } else {
                        res.status(500);
                        res.json('No such record');
                    };
                });
        }).catch(errors => {
            res.status(400);
            res.json(errors);
            console.log(errors);
        });
});

router.delete('/:userId/recipes/:recipeId', (req, res) => {
    var dataBase = req.app.locals.db;
    var posterId = new mongodb.ObjectID(req.params.userId);
    var recipeId = new mongodb.ObjectID(req.params.recipeId);
    dataBase.collection('recipes').deleteOne({postedBy: posterId,_id: recipeId})
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
})

module.exports = router;