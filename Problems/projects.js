const express = require('express');
const mongo = require('mongodb');
const indicative = require('indicative');
const router = express.Router();

const ObjectID = mongo.ObjectID;

router.get('/', (req, res) =>{
    const db = req.app.locals.db;
    db.collection('Projects').find().toArray().then(projects => {
        res.json(projects);
    });
});

router.get('/:id', (req, res) => {
    const db = req.app.locals.db;
    var searchId = new ObjectID(req.params.id);
    console.log(searchId);
    db.collection('Projects').findOne({_id: searchId}, function(err, result) {
        if(err) throw err;
        console.log(result);
        res.json(result);
    })
});

router.put('/:id', (req, res) => {
    const db = req.app.locals.db;
    var seachId = String.toString(req.params.id);
    db.collection('Projects').findOne({_id: seachId}).then(project => {
        res.json(project);
    });
});

router.delete('/:id', (req, res) => {
    const db = req.app.locals.db;
    var seachId = ObjectID(ereq.params.id);
    console.log(seachId);
    db.collection('Projects').findOne({_id: seachId}).then(project => {
        res.json(project);
    });
});

router.post('/', (req, res) => {
    const dataBase = req.app.locals.db;
    const project = req.body;
    const rules = {

        date: 'required|string',
        authors: 'required|string',
        title: 'string',
        gitRepo: 'required|url',
        description: 'required|string',
        keywords: 'string',
        status: 'string',
    };
    indicative.validate(project, rules)
    .then((project) => { dataBase.collection('Projects').insertOne(project).then(result => {
            if(result.result.ok && result.insertedCount === 1) {
                const uri = req.baseUrl + '/' + project._id
                res.location(uri).status(201).json(project);
            }
        });
    }).catch(err => error(req, res, 400, `Invalid projects: ${util.inspect(err)}`, err))

    .catch((errors) => {
        console.log(errors);
    });
});


module.exports = router;