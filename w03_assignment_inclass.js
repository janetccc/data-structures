// This modified solution to Assignment 2 saves the data as a text file, but structured as an array
// which prepares for the work in Assignment 3. 

var fs = require('fs');

var request = require('request'); // npm install request
var async = require('async'); // npm install async

// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.API_KEY;

var meetingsData = [];
var addresses = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/meetings02.txt'));

function fixAddresses (oldAddress) {
    var newAddress = oldAddress.substring(0, oldAddress.indexOf(',')) + ", New York, NY"; //start at begining and stop at first comma (no include), add NY,NY
    return newAddress;
}

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + fixAddresses(value).split(' ').join('+') + '&key=' + apiKey;
    var thisMeeting = new Object;
    thisMeeting.address = value;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        meetingsData.push(thisMeeting);
    });
    setTimeout(callback, 200);
}, function() {
    fs.writeFileSync('/home/ubuntu/workspace/data/geocodedMeetings.txt', JSON.stringify(meetingsData));
});