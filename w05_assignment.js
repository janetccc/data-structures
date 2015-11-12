// var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async'); // npm install async
var request = require('request'); // npm install request

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var finalObject = {};

var locationName = [];
var groupName = [];
var geoCode = [];
var addressLine1 = [];
var addressLine1Detail = [];
var addressLine2 = [];
var meetingNotes = [];
var meetingAccess = [];
var meetingStartTime = [];
var meetingEndTime = [];
var meetingDay = [];
var meetingType = [];
var meetingInterest = [];
var addressGoogle = [];

var meeting0 = {};
var meeting1 = {};
var meeting2 = {};
var meeting3 = {};
var meeting4 = {};
var meeting5 = {};
var meeting6 = {};
var meeting7 = {};
var meeting8 = {};
var meeting9 = {};
var meeting10 = {};
var meeting11 = {};
var meeting12 = {};
var meeting13 = {};
var meeting14 = {};
var meeting15 = {};
var meeting16 = {};
var meeting17 = {};
var meeting18 = {};
var meeting19 = {};
var meeting20 = {};
var meeting21 = {};
var meeting22 = {};
var meeting23 = {};
var meeting24 = {};
var meeting25 = {};
var meeting26 = {};
var meeting27 = {};


///////step1////////

//parse data

getMeetingLocationName();
getMeetingAddress();
getMeetingGroupName();
getMeetingDay();
getMeetingNotes();
getMeetingAccess();

var apiKey = process.env.API_KEY;
var meetingsData = [];
var count = 0;

formatObject();

///////step1 functions////////


//Get Geocode------------------------

// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR


// eachSeries in the async module iterates over an array and operates on each item in the array in series
function formatObject () {
    async.eachSeries(addressLine1, function(value, callback) {
        var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
        var thisMeeting = new Object;
        thisMeeting.address = value;
        request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
            meetingsData.push(thisMeeting);
            count = count + 1;
            // console.log('Loading: '+count+'/28');
        });
        setTimeout(callback, 200);
    }, function() {
        geoCode = meetingsData;
        console.log('meetingsData > geoCode');
        fs.writeFileSync('/home/ubuntu/workspace/data/meetings_geodataFull.txt', JSON.stringify(geoCode));
        console.log('meetingsData > meetings_geodataFull.txt');
        createFinalObject(true);
    });
}
//----------------------------- end of getGeocode
function getMeetingLocationName () {
    $('tbody').find('tr').each(function(a, elem){
        var rawData = $(elem).find('td').eq(0).html().split('<br>')[0].trim();
        locationName.push(rawData.split('>')[1].split('<')[0].split(' -')[0].split('100')[0]);
    });
}

function getMeetingNotes () {
    $('tbody').find('tr').each(function(a, elem){
        meetingNotes.push($(elem).find('div').text().replace('*', '').trim());
    });
}

function getMeetingGroupName () {
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        locationName.push($(elem).find('td').eq(0).find('h4').text());
    
        var rawData = $(elem).find('td').eq(0).find('b').text().trim().toUpperCase();
        var first = rawData.substr(0, rawData.lastIndexOf('-') - 1); // before -
        var second = rawData.substr(rawData.lastIndexOf('-') + 2); // after -
        
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
        
        groupName.push(finalData);
    });
}

function getMeetingAddress () {
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        var edited;
        
        addressLine1.push(getAddress1('street'));
        addressLine1Detail.push(getAddress1('detail'));
        rawData = $(elem).find('td').eq(0).html().split('<br>')[3].trim();
        addressLine2.push(rawData.split('100')[0].replace('NY', '').trim());
        
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
            
            addressGoogle.push(edited);
            return finalData;
        } //end of getAddress1 func

    });
}

function getMeetingDay () {
    var dayFinal = [];
    var startTimeFinal = [];
    var endTimeFinal = [];
    var typeFinal = [];
    var interestFinal = [];
    $('tbody').find('tr').each(function(a, elem){
        var string = $(elem).find('td').eq(1).text().trim();
        var indexContainer = findTargetLocation(string, 'days');
        var indexContainerB = findTargetLocation(string, 'From');
        var indexContainerC = findTargetLocation(string, 'to');

        var dayContainer = [];
        var startTimeContainer = [];
        var endTimeContainer = [];
        var typeContainer = [];
        var interestContainer = [];
        
        for (var i = 0; i < indexContainer.length; i++) { 
            var first = indexContainer[i]; //find day
            var second = indexContainer[i + 1]; //find 2nd day
            var firstB = indexContainerB[i]; //find from
            var firstC = indexContainerC[i]; //find to
            
            var fullData = string.substring(first, second);
            var step1 = string.substring(first - 7, firstB); //btwn days and From
            var step2 = string.substring(firstB + 6, firstC); //btwn From and to
            var step3 = string.substring(firstC + 3, firstC + 11); //btwn to and after (eliminate to)
            
            var checkDay = step1.indexOf('days') > -1; //see if days exists
            var checkInterest = fullData.indexOf('Special') > -1;
            var checkType = fullData.indexOf('=') > -1;
            
            if (checkDay == true) {
                dayContainer.push(step1.split(/\t/)[0].trim());//split after tab (removing leftover of [Mon/Fri...])
                startTimeContainer.push(step2.trim());
                endTimeContainer.push(step3.trim());
            } else if (checkDay == false) {
                dayContainer.push(string.split('to 12:00 AM')[1].split('From')[0].trim());
                startTimeContainer.push(string.split('From')[2].split('to')[0].trim());
                endTimeContainer.push(string.split('to')[2].split('Meet')[0].trim());
            }
            
            if (checkInterest == true){
                interestContainer.push(fullData.split('Interest')[1].split(/\t/)[0].trim());  
            } else if (checkInterest == false) {
                interestContainer.push('');    
            }
            
            if (checkType == true){
                typeContainer.push(fullData.split('=')[1].split(/\t/)[0].split('meeting')[0].trim());
            } else if (checkInterest == false) {
                typeContainer.push('');   
            }
            
            dayFinal = dayContainer;
            startTimeFinal = startTimeContainer;
            endTimeFinal = endTimeContainer;
            typeFinal = typeContainer;
            interestFinal = interestContainer;
            first = indexContainer[i + 1];
            firstB = indexContainerB[i + 1];
            firstC = indexContainerC[i + 1];
        }
        
        meetingDay.push(dayFinal);
        meetingStartTime.push(startTimeFinal);
        meetingEndTime.push(endTimeFinal);
        meetingType.push(typeFinal);
        meetingInterest.push(interestFinal);
    }); // end of tbody
}

function getMeetingAccess () {
    $('tbody').find('tr').each(function(a, elem){
        meetingAccess.push($(elem).find('span').eq(0).text().trim());
    });
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

breakdownTimes(meetingStartTime[11]);

function breakdownTimes(time){
    console.log('time: ' + time);
    if (time.length > 0) {
        console.log('need to breat down');
    } else if (time.length == 0 ) {
        console.log("don't need to break down");
    }
    var meetingsection = {};
    var allMeetings = [];
    for (var i = 0; i < time.length; i++) { 
        meetingsection[i].time = time[i];
        meetingsection[i].type = meetingType[i];
        console.log('seperate: ' + meetingsection[i]);
        allMeetings.push(meetingsection[i]);
    }
    
    console.log('allMeetings: ' + allMeetings);
}

function inputData (meetingNumber, a){
    for (var i = 0; i < 11; i++) { 
        meetingNumber.locationName = locationName[a];
        meetingNumber.groupName = groupName[a];
        meetingNumber.latLong = geoCode[a];
        meetingNumber.addressLine1 = addressLine1[a];
        meetingNumber.addressLine1Detail = addressLine1Detail[a];
        meetingNumber.addressLine2 = addressLine2[a];
        meetingNumber.Notes = meetingNotes[a];
        meetingNumber.Access = meetingAccess[a];
        meetingNumber.Day = meetingDay[a];
        meetingNumber.StartTime = meetingStartTime[a];
        meetingNumber.EndTime = meetingEndTime[a];
        meetingNumber.Type = meetingType[a];
        meetingNumber.Interest = meetingInterest[a];
    }
    return meetingNumber;
}

function createFinalObject(status) {
    if (status == true) {
        finalObject = [inputData(meeting0, 0), inputData(meeting1, 1), inputData(meeting2, 2), inputData(meeting3, 3), inputData(meeting4, 4), inputData(meeting5, 5), inputData(meeting6, 6), inputData(meeting7, 7), inputData(meeting8, 8), inputData(meeting9, 9), inputData(meeting10, 10), inputData(meeting11, 11), inputData(meeting12, 12), inputData(meeting13, 13), inputData(meeting14, 14), inputData(meeting15, 15), inputData(meeting16, 16), inputData(meeting17, 17), inputData(meeting18, 18), inputData(meeting19, 19), inputData(meeting20, 20), inputData(meeting21, 21), inputData(meeting22, 22), inputData(meeting23, 23), inputData(meeting24, 24), inputData(meeting25, 25), inputData(meeting26, 26), inputData(meeting27, 27)];
        fs.writeFileSync('/home/ubuntu/workspace/data/sortedMeetings02M.txt', JSON.stringify(finalObject));
        console.log('finalObject > sortedMeetings02M.txt');
    } else if (status == false) {
        console.log('not ready');
    } else {
        console.log('error');
        console.log('status: ' + status);
    }
}

/////////step1 complete///////

