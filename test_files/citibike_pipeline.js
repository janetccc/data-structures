// QUERY MONGODB

var dbName = 'citibike';
var collName = 'dockingStations';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);
    
    
    collection.aggregate([
        { $match :
            { availableBikes : 0 } 
        }, { $group : 
            { _id: null, 
                count: { $sum : 1}, 
                "avgerageNumberStations" : { $avg : "$totalDocks" }
            }
        }
    ]).toArray(function(err, docs) {
    
    //  collection.aggregate([{ $match :{ availableBikes : 0 } }]).toArray(function(err, docs) {
    
    // collection.aggregate([{ $sort : { longitude: -1} }, {$limit : 1 }]).toArray(function(err, docs) {
    // collection.aggregate([{ $group : { _id : "$statusValue", count : {$sum : 1} } }]).toArray(function(err, docs) {
    collection.aggregate([{ $match :{ statusValue : "Not In Service" }}, { $group: { _id: null, count:{ $sum : 1}}}]).toArray(function(err, docs) {
    // collection.aggregate([{ $group : { _id : null, "avgerageNumberStations" : { $avg : "$totalDocks" } } }]).toArray(function(err, docs) {
    // collection.aggregate([{ $limit : 3 }]).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            console.log(docs);
        }
        db.close();
        
    });

}); //MongoClient.connect