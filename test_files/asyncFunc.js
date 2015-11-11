var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var meetings = [];

var addressLine1 = [];

// $('tbody').find('tr').each(function(i, elem){
//     meetings = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
//     addresses.push(meetings.substring(0, meetings.indexOf(',')) + ', New York, NY');
// });

function getMeetingAddress () {
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        var edited = [];
        var finalData = [];
        
        addressLine1.push(getAddress1('street'));
            
        function getAddress1 (section) {
            rawData = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
            
            if (section == 'street') {
                if (rawData.indexOf('Strert') > -1) { // Correct Spellinsg
                    rawData = rawData.replace('Strert', 'Street');
                } else if (rawData.indexOf('W.') > -1) { // Change format, for consistency
                    rawData = rawData.replace('W.', 'West');
                } else if (rawData.indexOf('Bowery Street') > -1) { // Change format, for consistency 
                    rawData = rawData.replace(' Street', '').substring(0, rawData.indexOf(',')).trim();
                }
                cleanUp1 = rawData.substring(0, rawData.indexOf(','));
                finalData = cleanUp1 + ', New York, NY';
                edited = finalData.replace(',', '').split(' ').join('+');
                
            } else if (section == 'detail') {
                cleanUp1 = rawData.replace('(', ',');
                finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
            }
            
            return finalData;
        } //end of getAddress1 func
        
    });
}

getMeetingAddress();



// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.API_KEY;

var meetingsData = [];
// var addresses = ["63 Fifth Ave, New York, NY", "16 E 16th St, New York, NY", "2 W 13th St, New York, NY"];

var count = 0;

console.log(addressLine1);
// console.log(addresses);

// eachSeries in the async module iterates over an array and operates on each item in the array in series

test();

function test () {
async.eachSeries(addressLine1, function(value, callback) {
    console.log('all addresses obtained');
    // console.log('addressGoogle: ' + addressGoogle[9]);  
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
    fs.writeFileSync('/home/ubuntu/workspace/data/meetings_geodataFull.txt', JSON.stringify(meetingsData));
    console.log('meetingsData > meetings_geodataFull.txt');
});
}