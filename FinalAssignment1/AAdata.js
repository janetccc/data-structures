// var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async'); // npm install async
var request = require('request'); // npm install request

var root = '/home/ubuntu/workspace/';

var urlContainer = [];
var fileContainer = [];

var geoCode = [];
var addressForGoogle = [];
var geoCodeContainer = [];

var meetingGeo = [];

var apiKey = process.env.API_KEY;
var meetingsData = [];
var count = 0;

// var content = fs.readFileSync(root + 'data/aameeting1M.txt');
// var $ = cheerio.load(content);

var zone = 1;
var zoneFile = root + 'data/aameeting' + zone + 'M.txt';
var content = fs.readFileSync(zoneFile);
var $ = cheerio.load(content);

async.waterfall([
    // createURL,
    // createFileNames,
    // getMeetingFromSite,
    getGeoData,
    textLoop,
    geoLoop,
    cleanUp,
    insertToMongo
], function (err, result) {
    console.log('!!!completed all!!!');    
    fs.writeFileSync(root + 'data/sortedMeetingsAll.txt', JSON.stringify(meetingsData));
});

function createURL (callback) { //create URL of aa website
    for (var i = 1; i < urlContainer.length; i++) { 
        var url;
        if (i == 10) {
            url = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=' + i + '&borough=M';
        } else {
            url = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=0' + i + '&borough=M';
        }
        urlContainer.push(url);
    }
    console.log('created URL');
    callback(null);
}

function createFileNames (callback) { //create file name & location to save meeting data from website
    for (var i = 1; i < urlContainer.length; i++) { 
        var file;
        file = root + 'data/aameeting' + i + 'M.txt';
        fileContainer.push(file);
    }
    console.log('created fileNames');
    callback(null);
}

function getMeetingFromSite (callback) { //get all meeting info from aa website
    for (var i = 1; i < urlContainer.length; i++) { 
        loadMeetingsData(urlContainer[i], fileContainer[i]);
    }
    console.log('obtained data from site');
    callback();
  
    function loadMeetingsData(url, fileLocation) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                fs.writeFileSync(fileLocation, body);
            } else {
                console.error('request failed');
            }
        });
    }
}

function textLoop (callback) {
    for (var i = 1; i < 11; i++) { 
        parseTextData(i);
        console.log('completed zone ' + i);
    }
    callback();
}

function geoLoop (callback) {
    var allGeo = JSON.parse(fs.readFileSync(root + 'data/meetings_geodataFull.txt'));
    console.log(allGeo.length);
    for (var i = 0; i < allGeo.length; i++) { 
        meetingsData[i].latLong = allGeo[i].latLong;
        meetingsData[i].tag = i;
        // console.log('completed meeting ' + i);
    }
    callback();
}

function parseTextData(currentZone, callback) {
    zoneFile = 'data/aameeting' + currentZone + 'M.txt';
    content = fs.readFileSync(zoneFile);
    $ = cheerio.load(content);
    
    $('tbody').find('tr').each(function(a, elem){
        
        var locationName, groupName, addressLine1, addressLine1Detail, addressLine2, zipcode, meetingNotes, access, section;

        async.series([
            function (callback) {
                locationName = $(elem).find('td').eq(0).html().split('<br>')[0].trim().split('>')[1].split('<')[0].split(' -')[0].split('100')[0];
                groupName = getMeetingGroupName($(elem));
                addressLine1 = getAddress1($(elem), 'street');
                addressLine1Detail = getAddress1($(elem), 'detail');
                addressLine2 = $(elem).find('td').eq(0).html().split('<br>')[3].trim().split('100')[0].replace('NY', '').trim();
                zipcode = getZipcode($(elem));
                meetingNotes = $(elem).find('div').text().replace('*', '').trim();
                access = $(elem).find('span').eq(0).text().trim();
        
                section = getSection($(elem));
                
                callback(null);
            }
        ], function(err, results) {
            
            for (var i = 0; i < 10; i++) { 
                var meeting = {        
                    zone: currentZone,
                    location: locationName,
                    name: groupName,
                    addressLine1: addressLine1,
                    addressLine1Detail: addressLine1Detail,
                    addressLine2: addressLine2,
                    zipcode: zipcode,
                    notes: meetingNotes,
                    access: access,
                    section: section,
                };
            }
            meetingsData.push(meeting);
            
        });
        
    });

}

function getGeoData(currentZone, callback){
    
    for (var i = 1; i < 11; i++) { 
        zoneFile = 'data/aameeting' + i + 'M.txt';
        content = fs.readFileSync(zoneFile);
        $ = cheerio.load(content);
                    
        $('tbody').find('tr').each(function(a, elem){             
            addressForGoogle.push(getAddress1($(elem), 'street'));
        });
    }
        
    async.eachSeries(addressForGoogle, function(value, callback) {
        var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
        var thisMeeting = new Object;
        thisMeeting.address = value;
        request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
            geoCodeContainer.push(thisMeeting);
            count = count + 1;
            console.log('Loading: '+count+'/'+addressForGoogle.length);
        });
        setTimeout(callback, 200);
    }, function() {
        geoCode.push(geoCodeContainer);
        console.log('obtained geoCode');
        console.log('geocode: ' + geoCode);
        callback();
    });
}

function cleanUp (callback) {
    meetingsData[103].addressLine1 = meetingsData[103].addressLine1.replace('-208', '');
    meetingsData[41].addressLine1 = meetingsData[41].addressLine1.replace('Strert', 'Street');
    callback();
}

function insertToMongo() {
    
    // var meetingAddress = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/data/sortedMeetingsAll.txt'));
    var meetingAddress = meetingsData;
    var dbName = 'aa';
    var collName = 'meetings';
    
    // Connection URL
    var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;
    
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

function getMeetingGroupName (elem) {

    var rawData = elem.find('td').eq(0).find('b').text().trim().toUpperCase();
    var first = rawData.substr(0, rawData.lastIndexOf('-') - 1); // before -
    var second = rawData.substr(rawData.lastIndexOf('-') + 2); // after -
    var finalData;
    
    if (first.length < second.length) { // if second is full name
        
        if (second.indexOf('I)') > -1) { // if there is a number, clear the number
            second = second.substr(0, first.length);
        } else if (second.indexOf('AHEAD') > -1) { // exceptions: women straight ahead sat
            second = first + ' - ' + second;
        }

        finalData = second;
        
    } else if (first.length > second.length) { // if first is full name
    
        if (first.indexOf('-') > -1) { // if - still exists, take what is after - (targeting T&A)
            finalData = first.split('-')[1];
        } else if (first.indexOf('I') > -1) { // if number exists, clear number
        
            if (first.indexOf('ROOM') > -1) { // exceptions
                finalData = first.replace('    (', '(');  
            } else {
                finalData = first.split('(')[0].trim();
            }
            
        } else { // if - does not exist, use first
            finalData = first;
        }
        
    } else if (first.length == second.length) { // if both are same
        finalData = first;
    }
    
    return finalData;
}

function getAddress1 (elem, section) {
    var rawData = elem.find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
    var finalData = '';
    var cleanUp1 = '';
    // console.log(rawData);
    if (section == 'street') {
        if (rawData.indexOf('- ') > -1) {
            rawData = rawData.substring(0, rawData.indexOf('-')) + ',';
        } 

        if (rawData.indexOf('-208') > -1) {
            rawData = rawData.replace('-208', '');
        } 

        if (rawData.indexOf('58-66') > -1) {
            rawData = rawData.replace('-66', '');
        } 

        if (rawData.indexOf('@') > -1) {
            rawData = rawData.substring(0, rawData.indexOf('@')) + ',';
        } 

        if (rawData.indexOf('Rm 306') > -1) {
            rawData = rawData.split(' Rm 306')[0] + ',';
        } 

        if (rawData.indexOf('Good Shepard') > -1) {
            rawData = rawData.replace('Church of the Good Shepard, ', '');
        } 

        if (rawData.indexOf('Street.') > -1) { // Correct Spelling
            rawData = rawData.replace('Street.', 'Street,');
        } 

        if (rawData.indexOf('St.') > -1 && rawData.indexOf('Mark') == -1) { // Change format, for consistency
            rawData = rawData.replace('St.', 'Street');
        }

        if (rawData.indexOf('W.') > -1) { // Change format, for consistency
            rawData = rawData.replace('W.', 'West');
        } 

        if (rawData.indexOf('W ') > -1) { // Change format, for consistency
            rawData = rawData.replace('W ', 'West ');    
        }

        if (rawData.indexOf('E ') > -1) { // Change format, for consistency
            rawData = rawData.replace('E ', 'East ');    
        }

        if (rawData.indexOf('St. Mark') > -1) { // Change format, for consistency
            rawData = rawData.replace('St. Mark&apos;s', 'St Marks');
        }

        if (rawData.indexOf('Bowery Street') > -1) { // Change format, for consistency 
            rawData = rawData.replace(' Street', '').substring(0, rawData.indexOf(',')).trim();
        }

        if (rawData.indexOf('West &amp; 76th') > -1) { // Change format, for consistency 
            rawData = rawData.replace('&amp;', 'and').trim();
        }

        if (rawData.indexOf('Street &amp; Bennett') > -1) { // Change format, for consistency 
            rawData = rawData.replace('&amp;', 'and').trim();
        }

        if (rawData.indexOf('Powell Blvd.') > -1) { // Change format, for consistency 
            rawData = rawData.replace('Blvd.', 'Boulevard').trim();
        }

        cleanUp1 = rawData.substring(0, rawData.indexOf(','));
        finalData = cleanUp1 + ', New York, NY';
        // console.log(finalData);
        
    } else if (section == 'detail') {
        cleanUp1 = rawData.replace('(', ',');
        finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
    }
    
    return finalData;
} //end of getAddress1 func

function getSection (elem) {
    // var section = {};
    var sectionFinal = [];
    
    var string = elem.find('td').eq(1).text().trim();
    
    var indexContainer = findTargetLocation(string, 'days');
    var indexContainerB = findTargetLocation(string, 'From');
    var indexContainerC = findTargetLocation(string, 'to');

    var dayContainer, dayDigit, startTimeContainer, endTimeContainer, typeContainer, interestContainer, startHour;
    // var  = [];
    // var  = [];
    
    for (var i = 0; i < indexContainer.length; i++) { 
        var first = indexContainer[i]; //find day
        var second = indexContainer[i + 1]; //find 2nd day
        var firstB = indexContainerB[i]; //find from
        var firstC = indexContainerC[i]; //find to
        
        var fullData = string.substring(first, second);
        var step1 = string.substring(first - 7, firstB).trim(); //btwn days and From
        var step2 = string.substring(firstB + 6, firstC); //btwn From and to
        var step3 = string.substring(firstC + 3, firstC + 11).trim(); //btwn to and after (eliminate to)
        
        var checkDay = step1.indexOf('days') > -1; //see if days exists
        var checkInterest = fullData.indexOf('Special') > -1;
        var checkType = fullData.indexOf('=') > -1;
        
        // console.log(step3);
        
        if (step1 == 'Mondays') {
            dayDigit = 1;
        } else if (step1 == 'Tuesdays') {
            dayDigit = 2;
        } else if (step1 == 'Wednesdays') {
            dayDigit = 3;
        } else if (step1 == 'Thursdays') {
            dayDigit = 4;
        } else if (step1 == 'Fridays') {
            dayDigit = 5;
        } else if (step1 == 'Saturdays') {
            dayDigit = 6;
        } else if (step1 == 'Sundays') {
            dayDigit = 0;
        } 
        
        var hour = step2;
    
        
        if (hour.indexOf('PM') > 1) {
            hour = hour.split(':')[0]*1;
            
            if (hour == 12) {
                startHour = hour;
            } else if (hour < 12) {
                startHour = hour + 12;
            }
        } else if (hour.indexOf('AM') > 1) {
            hour = hour.split(':')[0]*1;
            if (hour == 12) {
                startHour = 0;
            } else if (hour < 12) {
                startHour = hour;
            }
        }
        
        if (checkDay == true) {
            dayContainer = step1.split(/\t/)[0].trim();//split after tab (removing leftover of [Mon/Fri...])
            startTimeContainer = step2.trim();
            endTimeContainer = step3.trim();
        } else if (checkDay == false) {
            dayContainer = string.split('to 12:00 AM')[1].split('From')[0].trim();
            startTimeContainer = string.split('From')[2].split('to')[0].trim();
            endTimeContainer = string.split('to')[2].split('Meet')[0].trim();
        }
        
        if (checkInterest == true){
            interestContainer = fullData.split('Interest')[1].split(/\t/)[0].trim();  
        } else if (checkInterest == false) {
            interestContainer = '';
        }
        
        if (checkType == true){
            typeContainer = fullData.split('=')[1].split(/\t/)[0].split('meeting')[0].trim();
        } else if (checkInterest == false) {
            typeContainer = '';
        }
    
        var section = {        
            day: dayContainer,
            dayDigit: dayDigit,
            startTime: startTimeContainer,
            startHour: startHour,
            endTime: endTimeContainer,
            type: typeContainer,
            interest: interestContainer
        };
        
        sectionFinal.push(section);

    } //end of for loop

    return sectionFinal;

}

function findTargetLocation (string, target) {
    var indexContainer = [];
    var index = string.indexOf(target);
    while (index >= 0) {
        indexContainer.push(index);
        index = string.indexOf(target, index + 1);
    }
    return indexContainer;
}

function getZipcode(elem) {
    var rawData = elem.find('td').eq(0).html().split('<br>')[3].trim();
    var cleanUp1;
    var finalData;

    if (rawData.indexOf('100') > 0) {
        cleanUp1 = rawData.split('100')[1];
    } else if (rawData.indexOf('NY 10') > 0) {
        cleanUp1 = rawData.split('10')[1];
    } else if (rawData.indexOf(') 10') > 0) {  
        cleanUp1 = rawData.split('10')[1];
    } else {
        var line2 = elem.find('td').eq(0).html().split('<br>')[2];
        
        if (line2.indexOf('100') > 0) {
            cleanUp1 = line2.split('100')[1];
            // console.log('see: ' + cleanUp1);

            if (cleanUp1 == '44,') {
                cleanUp1 = cleanUp1.replace(',', '');
            }

        } else if (line2.indexOf(' 10') > 0) {
            cleanUp1 = line2.split('10')[1];
        }
    }

    if (cleanUp1 == '') {
        finalData = cleanUp1;
    } else if (cleanUp1*1 >= 100) {
        finalData = '10' + cleanUp1;
    } else if (cleanUp1*1 < 100) {
        finalData = '100' + cleanUp1;
    } else  {
        // console.log('here');
        finalData = cleanUp1;
        if (cleanUp1 == '44,') {
            finalData = '10044';
            // console.log('yes ' + cleanUp1);
        }
    }

    return finalData;
}