var dbName = 'aa';
var collName = 'meetings';
var fs = require('fs');

var root = '/home/ubuntu/workspace/';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

var meetings = [];

MongoClient.connect(url, function(err, db) {
    if (err) {
        return console.dir(err);
    }

    var collection = db.collection(collName);

    collection.aggregate( [

        { $unwind : "$section" },
        
        { $match : { 
            $or: [
                {$and: [
                    { "section.dayDigit" : 6 },
                    { "section.startHour" : { $gte: 0, $lte: 23 } }
                ]},
                {$and: [
                    { "section.dayDigit" : 0 },
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
                                                    // startHour : "$startTimeHour",
                                                    endTimes : "$endTime",
                                                    meetingTypes : "$meetingType",
                                                    specialInterest : "$specialInterest"
                                                    }
                    } }
                    } }
        
         ]).toArray(function(err, docs) {
        if (err) {console.log(err);}
        else {
            // console.log(JSON.stringify(docs));
            for (var i=0; i < docs.length; i++) {
                console.log(JSON.stringify(docs[i], null, 4));
                meetings.push(JSON.stringify(docs[i], null, 4))
                console.log('');
            }
            
            
        }
        db.close();
        
    });
    

}); //MongoClient.connect

