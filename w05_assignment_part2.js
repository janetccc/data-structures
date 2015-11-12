var fs = require('fs');

var meetingAddress = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/sortedMeetings02M.txt'));
var dbName = 'aa';
var collName = 'area02M';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb


//!!!!!get things into database--------------
MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}
    //I created a document called "meetings" inside the "aameetings" database
    var collection = db.collection(collName);

    // put the meetings data we have into the database
    // collection.insert(finalObject);
    
    // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
    for (var i=0; i < meetingAddress.length; i++) {
        collection.insert(meetingAddress[i]);
        console.log((i + 1) + '/' + meetingAddress.length);
    }
    db.close();
});


// //!!!!!get things into database--------------
// MongoClient.connect(url, function(err, db) {
//     if (err) {return console.dir(err);}

//     var collection = db.collection(collName);


// //  collection.aggregate([{ $match :{ availableBikes : 0 } }]).toArray(function(err, docs) {
//     collection.aggregate(
//         [
//             { $match :{ StartTime : '8:00 AM' } }
//             // { $sort: { score: { $meta: "textScore" } } },
//         ]
//     ).toArray(function(err, docs) {
//     // collection.aggregate([{ $limit : 3 }]).toArray(function(err, docs) {
//         if (err) {console.log(err)}
        
//         else {
//             console.log(docs);
//         }
//         db.close();
        
//     });

// }); //MongoClient.connect