var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var finalObject = {};
var locationName = [];
var groupName = [];
var addressLine = [];
var addressDetail = [];
var meetingNote = [];
var meetingAccess = [];
var meetingTime = [];
var meetingType = [];

var dataCategory = ['locationName', 'groupName', 'addressLine', 'addressDetail', 'meetingNotes', 'meetingAccess', 'meetingTime']


getData (locationName, 0, 0);
getData (groupName, 0, 1);
getData (addressLine, 0, 2, 'part1');
getData (addressDetail, 0, 2, 'part2');
getData (meetingNote, 0, null, 'meeting notes');
getData (meetingAccess, 0, null, 'meeting access');
getData (meetingTime, 1, null, 'meeting time');
// getData (meetingType, 1, null, 'meeting type');

// console.log(meeting0);

function getData (item, column, section, note) {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        
        var cleanUp1 = [];
        
        if (column == 1) {
            //if not splitting time & meeting type
            finalData = $(elem).find('td').eq(column).text().trim();
        
        } else if (note == 'meeting notes') {
            finalData = $(elem).find('div').text().replace('*', '').trim();
        
        } else if (note == 'meeting access'){
            finalData = $(elem).find('span').eq(column).text().trim();

        } else {
            rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim();
            
            if (note == 'part1') {
                cleanUp1 = rawData.replace('(', ',');
                finalData = cleanUp1.substring(0, cleanUp1.indexOf(',')); // + ', New York, NY')
                
            } else if (note == 'part2') {
                cleanUp1 = rawData.replace('(', ',');
                finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
                
            } else {
                finalData = rawData.split('>')[1].split('<')[0].split(' -')[0].split('100')[0];
            } 
        }
        item.push(finalData)
        
    });

    
    // for (i = 0; i < finalData.length; i++) { 
       
    // }
    
    //push from array into objects
}

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




testRun(meeting0, 0);
testRun(meeting1, 1);
testRun(meeting2, 2);
testRun(meeting3, 3);
testRun(meeting4, 4);
testRun(meeting5, 5);
testRun(meeting6, 6);
testRun(meeting7, 7);
testRun(meeting8, 8);
testRun(meeting9, 9);


// console.log(locationName)

function testRun (meetingNumber, a){
    var i;
    for (i = 0; i < dataCategory.length; i++) { 
        var currentCategory = dataCategory[i];
        if ( i == 0) {
            meetingNumber[currentCategory] = locationName[a];
        } else if (i == 1) {
            meetingNumber[currentCategory] = groupName[a];
        } else if (i == 2) {
            meetingNumber[currentCategory] = addressLine[a];
        } else if (i == 3) {
            meetingNumber[currentCategory] = addressDetail[a];
        } else if (i == 4) {
            meetingNumber[currentCategory] = meetingNote[a];
        } else if (i == 5) {
            meetingNumber[currentCategory] = meetingAccess[a];
        } else if (i == 6) {
            meetingNumber[currentCategory] = meetingTime[a];
        } 
    }
}

console.log(meeting9)
// function sortData (meetingNumber) {
    
// }






            // rawData = $(elem).find('td').eq(column).text();
            // if (note == 'meeting time') {
            //     cleanUp1 = rawData.replace('Meeting', '+');
            //     console.log(cleanUp1);
            //     if (cleanUp1.indexOf("AM") < -1) {   
            //     // if (rawData.indexOf("AM") > -1) {   
            //         finalData = cleanUp1;
            //     } else {
                    
            //     }
            // } else if (note == 'meeting type') {
            //     console.log(rawData.indexOf('Meeting'));
            //     finalData = rawData;
            // }
                
                
                //if split via indexOf??
            //rawData = $(elem).find('td').eq(column).text();
            // if (note == 'meeting time') {
                // finalData = rawData.substring(0, rawData.indexOf('Meeting')).trim();
            // } else if (note == 'meeting type') {
            //     console.log(rawData.indexOf('Meeting'));
            //     finalData = rawData;
            // }