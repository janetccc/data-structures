var fs = require('fs');

var meetingAddress = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/sortedMeetingsAll.txt'));
var dbName = 'aa';
var collName = 'meetings';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

//!!!!!get things into database--------------


insertToMongo();

function insertToMongo() {
    
    // Retrieve
    var MongoClient = require('mongodb').MongoClient; // npm install mongodb
    
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
}
