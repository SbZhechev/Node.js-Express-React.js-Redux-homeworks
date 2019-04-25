const mongoClient = require('mongodb').MongoClient;

var dburl = "mongodb://localhost:27017/ProjectManagement";

mongoClient.connect(dburl, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.db('ProjectManagement').createCollection('Projects', (err) =>{
      if(err) throw err;
      console.log('Collection created');
      db.close();
  });
});
