// IN THE MONGO SHELL: 
//   CREATE DATABASE citibike AND SWITCH TO IT WITH: 
//      use citibike
//   CREATE COLLECTION stations WITH: 
//      db.createCollection('stations')

var request = require('request');

request('https://www.citibikenyc.com/stations/json', function(error, response, body) {
    var stationData = JSON.parse(body); //turning into variable that we can act on

    // Connection URL
    var url = 'mongodb://' + process.env.IP + ':27017/citibike';

    // Retrieve
    var MongoClient = require('mongodb').MongoClient; // npm install mongodb

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);} //if error, send to console: error

        var collection = db.collection('dockingStations');

        //THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
        for (var i=0; i < stationData.stationBeanList.length; i++) {
            // console.log(stationData.stationBeanList[i])
            collection.insert(stationData.stationBeanList[i]); //insert array value
            }
        
        // collection.insert(stationData);
        
        db.close(); //close connection & return data

    }); //MongoClient.connect

}); //request