// QUERY MONGODB

var fs = require('fs');

var data1 = fs.readFileSync(__dirname + '/index1.html');
var data3 = fs.readFileSync(__dirname + '/index3.html');

var http = require('http');

var dbName = 'aa';
var collName = 'meetings';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;


var server = http.createServer(function(req, res) {
    var date = new Date();
    var setDay = date.getDay();
    var setStartTime = date.getHours();
    var setNextDay = setDay + 1;
    if ( setDay == 7 ) {
        setNextDay = 0;
    }

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}
    
        var collection = db.collection(collName);
    
        collection.aggregate( [
        
                { $unwind : "$section" },
                
                { $match : { 
                    $or: [
                        {$and: [
                            { "section.dayDigit" : setDay },
                            { "section.startHour" : { $gte: setStartTime, $lte: 23 } }
                        ]},
                        {$and: [
                            { "section.dayDigit" :  setNextDay},
                            { "section.startHour" : { $gte: 0, $lte: 4 } }
                        ]},
                    ]
                    
                } },
                
                { $group : {  _id : { 
                    meetingName : "$name",
                    meetingBuilding : "$location",
                    meetingAddress1 : "$addressLine1",
                    meetingAddress2 : "$addressLine1Detailed",
                    meetingAddress3 : "$addressLine2",
                    zipcode : "$zipcode",
                    meetingDetails : "$notes",
                    meetingWheelchair : "$access",
                    latLong : "$latLong"
                }, 
                    meetingDay : { $push : "$section.day" },
                    startTime : { $push : "$section.startTime" },
                    startTimeHour : { $push : "$section.startHour" },
                    endTime : { $push : "$section.endTime" },
                    meetingType : { $push : "$section.type" },
                    specialInterest : { $push : "$section.Interest" }
                }},
                
                { $group : { _id : { latLong : "$_id.latLong" }, 
                            meetingGroups : { $addToSet : {  meetingGroup : "$_id", 
                                                            meetings : {
                                                            meetingDays : "$meetingDay",
                                                            startTimes : "$startTime",
                                                            startHour : "$startTimeHour",
                                                            endTimes : "$endTime",
                                                            meetingTypes : "$meetingType",
                                                            specialInterest : "$specialInterest"
                                                            }
                            } }
                            } }
                
                 ]).toArray(function(err, docs) {
            if (err) {console.log(err)}
            
            else {
            
                res.writeHead(200, {'content-type': 'text/html'});
                res.write(data1);
                res.write('var meetings = ' + JSON.stringify(docs) + ';');
                res.end(data3);
                res.end();
            }
     
            db.close();
     
        });
    
    }); //MongoClient.connect

});

server.listen(process.env.PORT);