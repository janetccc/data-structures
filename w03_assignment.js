var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var meetings = [];

var addresses = [];

$('tbody').find('tr').each(function(i, elem){
    meetings = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
    addresses.push(meetings.substring(0, meetings.indexOf(',')) + ', New York, NY');
});

console.log('all addresses obtained');

// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.API_KEY;

var meetingsData = [];
// var addresses = ["63 Fifth Ave, New York, NY", "16 E 16th St, New York, NY", "2 W 13th St, New York, NY"];

var count = 0;

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
    var thisMeeting = new Object;
    thisMeeting.address = value;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        meetingsData.push(thisMeeting);
        count = count + 1;
        console.log('Loading: '+count+'/28');
    });
    setTimeout(callback, 200);
}, function() {
    fs.writeFileSync('/home/ubuntu/workspace/data/meetings_geodata.txt', JSON.stringify(meetingsData));
    console.log('meetingsData > meetings_geodata.txt');
});