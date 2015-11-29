// var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async'); // npm install async
var request = require('request'); // npm install request

var urlContainer = [];
var fileContainer = [];

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var apiKey = process.env.API_KEY;
var meetingsData = [];
var count = 0;

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
var finalData = [];

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
var finalObject = {};
var zone = 2;

///-----------------------

parseData();// part 1

function parseData() {
    async.waterfall([
        createRawDataTxt, //GETTING ALL RAW DATA FROM WEBSITE TO TXT
        cleanData//get data ready for mongo
    ], function (err, result) {
    // result now equals 'done' 
        console.log('!!!completed part 1!!!');
        // console.log('final 12: ' + JSON.stringify(finalObject[12]));
        // console.log(meetingDay[12].length);
        // var holder = meetingDay[12];
        // console.log(holder[1]);
        
        breakdownTimes(meetingDay[12], 12);
        
        // console.log('day: ' + meetingDay.length);
        // console.log('start: ' + meetingStartTime.length);
        // console.log('end: ' + meetingEndTime.length);
        // console.log('type: ' + meetingType.length);
        // console.log('interest: ' + meetingInterest.length);
    });
}

//GETTING ALL RAW DATA FROM WEBSITE TO TXT
function createRawDataTxt(callback) {
    async.waterfall([
        createURL,
        createFileNames,
        getMeetingFromSite
    ], function (err, result) {
        // result now equals 'done' 
        console.log('obtaining all data from site to txt');
        console.log('---------');
        callback(null);
    });
}

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
        if (i == 10) {
            file = '/home/ubuntu/workspace/data/aameeting' + i + 'M.txt';
        } else {
            file = '/home/ubuntu/workspace/data/aameeting0' + i + 'M.txt';
        }
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



///////step1////////
function cleanData(callback) {//get data ready for mongo
  async.waterfall([
    getTextData,
  ], function (err, result) {
    console.log('completed cleaning data, ready to put into mongo');
    console.log('---------');
    callback();
  });
}



function getTextData(callback) {
    async.waterfall([
        textData
    ], function (err, result) {
        // getMeetingSection();
        console.log('obtained all text data');
        callback(null);
    });
}

function textData (callback) {
    getMeetingLocationName();
    getMeetingNotes();
    getMeetingGroupName();
    getMeetingAddress();
    getMeetingDay();
    getMeetingAccess();
    callback();
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
    });
}

function getMeetingAddress () {
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
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
                
            } else if (section == 'detail') {
                cleanUp1 = rawData.replace('(', ',');
                finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
            }
            
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

function getMeetingSection () {
    for (var i = 0; i < groupName.length; i++) { 
        breakdownTimes(meetingDay[i], i);
    }
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
        allSections.push(JSON.stringify(section));
    }
    
    meetingSection.push(allSections);
    console.log(meetingSection);
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