const express = require('express');
const mongodb = require('mongodb');
const mongoClient = require('mongodb').MongoClient;
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
            registrationDate: 'date',
            lastModified: 'string'
        })
        .then(newUser => {
            const date = new Date();
            newUser.lastModified = `0${date.getDate()}.0${date.getMonth()}.${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
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
                    accountStatus: newAccountStatus,
                    registrationDate: newRegistrationDate } = updatedUser;
            dataBase.collection('users').updateOne({_id:searchId},
                {$set:{ name: newName, 
                    username: newUserName, 
                    password: newPassword,
                    gender: newGender,
                    accountType: newAccountType,
                    picture: newPicture,
                    bio: newBio,
                    accountStatus: newAccountStatus,
                    registrationDate: newRegistrationDate,
                    lastModified: `0${newlastModified.getDate()}.0${newlastModified.getMonth()+1}.${newlastModified.getFullYear()} ${newlastModified.getHours()}-${newlastModified.getMinutes()}-${newlastModified.getSeconds()}`}},
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


module.exports = router;