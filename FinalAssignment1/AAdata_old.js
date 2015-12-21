// var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async'); // npm install async
var request = require('request'); // npm install request

var root = '/home/ubuntu/workspace/';

var urlContainer = [];
var fileContainer = [];

var apiKey = process.env.API_KEY;
var meetingsData = [];
var count = 0;

// function makeMeetingGroup () {
//     var thisMeetingGroup = {}; 
    // thisMeetingGroup.meetingName = //PARSE HERE;
    
//     meetingsData.push(thisMeetingGroup);
// }

var allZone = [];
var meetingAmounts = [];
var locationName = [];
var groupName = [];
var geoCode = [];
var addressLine1 = [];
var addressLine1Detail = [];
var addressLine2 = [];
var zipcode = [];
var meetingNotes = [];
var meetingAccess = [];
var meetingStartTime = [];
var meetingEndTime = [];
var meetingDay = [];
var meetingType = [];
var meetingInterest = [];
var finalData = [];
var finalObject = [];

///-----------------------

var zone = 1;
var zoneFile = root + 'data/aameeting' + zone + 'M.txt';
var content = fs.readFileSync(zoneFile);
var $ = cheerio.load(content);

async.waterfall([
    parseData,
    getGeoData,

    createFinalObject   
], function (err, result) {
	console.log('groups:' + meetingAmounts); 
    console.log('!!!completed all!!!');        
});

// function clearBackslash(input){
// 	var result = JSON.stringify(input[0]);
// 	console.log(result);
// 	result = result.replace(/\"/g, '"');
// 	result = result.replace(/\\/g, '');
// 	input = result;
// }

function parseData(callback) {
    async.waterfall([
        createURL,
        createFileNames,
        getMeetingFromSite, //GETTING ALL RAW DATA FROM WEBSITE TO TXT
        parseZones
    ], function (err, result) { 
        console.log('!!!completed part 1!!!'); 
        callback();       
    });
}

function parseZones (callback) {
    async.eachSeries(fileContainer, function (file, callback) {
        zoneFile = 'data/aameeting' + zone + 'M.txt';
        content = fs.readFileSync(zoneFile);
        $ = cheerio.load(content);

        //cleaning data
        getTextData();
        meetingAmounts.push(groupName.length);
        console.log('zone: ' + zone + '; number of meetings: ' + groupName.length);
        getMeetingSection();
        // inputData();
 
        //continue to next zone
        if (zone >= 10 ) {
            zone = 10;
        } else if (zone <= 10) {
            zone++;
        }

        callback(); // Alternatively: callback(new Error());

    }, function (err) {
        if (err) { throw err; }
        console.log('parsed data from all zones!');
        callback();
    });
}

// function sectionOut() {
// 	async.waterfall([
//         getGeoData,
//         // cleanData,  //get data ready for mongo
//         createFinalObject
//     ], function (err, result) {
//     // result now equals 'done' 
//         console.log('!!!completed part 1!!!');        
//     });
// }

function createURL (callback) { //create URL of aa website
    for (var i = 1; i < 11; i++) { 
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
    for (var i = 1; i < 11; i++) { 
        var file;
        file = root + 'data/aameeting' + i + 'M.txt';
        fileContainer.push(file);
    }
    console.log('created fileNames');
    callback(null);
}

function getMeetingFromSite (callback) { //get all meeting info from aa website
    for (var i = 0; i < urlContainer.length; i++) { 
        loadMeetingsData(urlContainer[i], fileContainer[i]);
    }
    console.log('obtained data from site');
    callback(null);
  
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

function getGeoData (callback) {
    async.eachSeries(addressLine1, function(value, callback) {
    	// console.log('in get geo data ' + addressLine1.length);
        var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
        var thisMeeting = new Object;
        thisMeeting.address = value;
        request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
            meetingsData.push(thisMeeting);
            count = count + 1;
            console.log('Loading: '+count+'/'+groupName.length);
        });
        setTimeout(callback, 500);
    }, function() {
        geoCode.push(meetingsData);
        console.log('obtained geoCode');
        // separateGeoCode(geoCode);
        callback();
        fs.writeFileSync(root + 'data/meetings_geodataFull.txt', JSON.stringify(geoCode));
        // console.log('--file updated: meetingsData > meetings_geodataFull.txt');
    });
}

function getTextData () {
    getMeetingLocationName();
    getMeetingNotes();
    getMeetingGroupName();
    getMeetingAddress();
    getMeetingDay();
    getMeetingAccess();
}

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
        allZone.push(zone);
    });
}

function getMeetingAddress (callback) {
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
        addressLine1.push(getAddress1('street'));
        addressLine1Detail.push(getAddress1('detail'));
        rawData = $(elem).find('td').eq(0).html().split('<br>')[3].trim();
        addressLine2.push(rawData.split('100')[0].replace('NY', '').trim());
        zipcode.push(getZipcode());
        
        function getAddress1 (section) {
            rawData = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');

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

                if (rawData.indexOf('Strert') > -1) { // Correct Spelling
                    rawData = rawData.replace('Strert', 'Street');
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
                
            } else if (section == 'detail') {
                cleanUp1 = rawData.replace('(', ',');
                finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
            }
            
            return finalData;
        } //end of getAddress1 func

        function getZipcode() {
            rawData = $(elem).find('td').eq(0).html().split('<br>')[3];

            if (rawData.indexOf('100') > 0) {
                cleanUp1 = rawData.split('100')[1];
            } else if (rawData.indexOf('NY 10') > 0) {
                cleanUp1 = rawData.split('10')[1];
            } else if (rawData.indexOf(') 10') > 0) {  
                cleanUp1 = rawData.split('10')[1];
            } else {
                var line2 = $(elem).find('td').eq(0).html().split('<br>')[2];
                
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

            return finalData.trim();
        }

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

function getMeetingSection (callback) {
    for (var i = 0; i < groupName.length; i++) { 
        breakdownTimes(meetingDay[i], i);
    }
    // callback();
}

var meetingSection = [];

function breakdownTimes(breakpoint, x){
    var allSections = [];
    var section = {};
    var dayHolder = meetingDay[x];
    var startHolder = meetingStartTime[x];
    var endHolder = meetingEndTime[x];
    var typeHolder = meetingType[x];
    var interestHolder = meetingInterest[x];

    for (var i = 0; i < breakpoint.length; i++) { 
        section.day = dayHolder[i];
        section.startTime = startHolder[i];
        section.endTime = endHolder[i];
        section.type = typeHolder[i];
        section.interest = interestHolder[i];
        allSections.push(section);
    }
    meetingSection.push(allSections);
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

var separatedGeoCode = [];

function separateGeoCode(input){
	var text = [];
	text.push(input);
	var step1 = text[0];
	for (var i = 0; i < 371; i++) { 
		cleanUp1 = step1.split(',')[i].replace('}]]', '').replace('[[{', '');
		separatedGeocode.push(cleanUp1);	
	}
	console.log(separatedGeoCode[0]);
	console.log(separatedGeoCode[2]);
}

function inputData (callback){ 
    var meeting = {};
    var meetingContainer = [];
    for (var i = 0; i < groupName.length; i++) { 
        meeting.zone = allZone[i];
        meeting.locationName = locationName[i];
        meeting.groupName = groupName[i];
        // meeting.latLong = geoCode[i];
        meeting.geoCode = separatedGeoCode[i];
        meeting.addressLine1 = addressLine1[i];
        meeting.addressLine1Detail = addressLine1Detail[i];
        meeting.addressLine2 = addressLine2[i];
        meeting.zipcode = zipcode[i];
        meeting.notes = meetingNotes[i];
        meeting.access = meetingAccess[i];
        meeting.section = meetingSection[i];
        meetingContainer.push((meeting));
    }
    // console.log('meeting container: ' + meetingContainer);
    // meetingContainer.replace('/', '');
    finalObject.push(meetingContainer);
    // console.log('finalObject: ' + finalObject);
    // callback();
}

function createFinalObject(callback) {
    inputData();
    // clearBackslash(finalObject);
    fs.writeFileSync(root + 'data/sortedMeetingsAll.txt', JSON.stringify(finalObject));
    console.log('--file updated: finalObject > sortedMeetingsAll.txt');
    callback();
}