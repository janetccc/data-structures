var fs = require('fs');

var meetingAddress = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/geocodedMeetings.txt'));

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/aa';

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection('meetings');

    // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
    for (var i=0; i < meetingAddress.length; i++) {
        collection.insert(meetingAddress[i]);
        console.log((i + 1) + '/' + meetingAddress.length);
    }
    db.close();
    

}); //MongoClient.connect
