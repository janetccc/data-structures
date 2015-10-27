var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var finalObject = {};
var locationName = [];
var groupName = [];
var address1 = [];
var address1Detail = [];
var meetingNotes = [];
var meetingAccess = [];
var meetingDay = [];
var meetingTime = [];
var meetingType = [];
var meetingInterest = [];

var dataCategory = ['locationName', 'groupName', 'address1', 'address1Detail', 'meetingNotes', 'meetingAccess', 'meetingDay', 'meetingTime', 'meetingType', 'meetingInterest'];

getData();

console.log(locationName[9]);
console.log(locationName[9]);
console.log(meetingType[9]);

function getData () {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
        meetingTime.push($(elem).find('td').eq(1).text().trim());
        meetingNotes.push($(elem).find('div').text().replace('*', '').trim());
        meetingAccess.push($(elem).find('span').eq(0).text().trim());
        address1.push(getAddress1('street'));
        address1Detail.push(getAddress1('detail'));
        groupName.push(getGroupName());
        locationName.push($(elem).find('td').eq(0).find('h4').text());
        
        //-------FUNCTIONS
        
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
        
        function getGroupName () {
            rawData = $(elem).find('td').eq(0).find('b').text().trim().toUpperCase();
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
            
            return finalData;
        } //end of getGroupName func
        
        rawData = $(elem).find('td').eq(1).text().trim();

        if ((rawData.match(/From/g) || []).length == 1) {
            meetingDay.push(rawData.split('From')[0]);
            if (rawData.indexOf('=') == -1){
                meetingType.push(undefined);
                meetingInterest.push(rawData.split('Interest ')[1]);
            } else if (rawData.indexOf('Special Interest Women') > 1) {
                meetingTime.push(rawData.split('From')[1].split('Special')[0].split('Meeting Type')[0].trim());
                meetingType.push(rawData.split('From')[1].split('Meeting Type')[1].split('meeting')[0].trim() + ' meeting');
                meetingInterest.push(rawData.split('Interest ')[1]);
            } else if (rawData.indexOf('Special Interest') == -1) {
                meetingInterest.push(undefined);
            } else {
                meetingTime.push(rawData.split('From')[1].split('Meeting Type')[0].trim());
                meetingType.push(rawData.split('From')[1].split('Meeting Type')[1].split('meeting')[0].trim() + ' meeting');
                meetingInterest.push(rawData.split('Interest ')[1]);
            }
            
        } else if ((rawData.match(/From/g) || []).length > 1) {
            meetingDay.push(getMeetingDay(rawData, 'days', -6));
            cleanUp1 = rawData;
            meetingTime.push(getMeetingTime(cleanUp1, 'Meeting Type', 0));
            meetingType.push(getMeetingType(cleanUp1, 'Type', 0));
            meetingInterest.push(getMeetingInterest(rawData, 'Special Interest', 0));
        }
        
        function getMeetingDay (string, target, a, callback) {
            var indexContainer = findTargetLocation(string, target);
            var first = 0;
            var textContainer = [];
            
            for (var i = 0; i < indexContainer.length; i++) {
                var second = indexContainer[i];
                var step1 = string.substring(first + a, second);
                
                if (step1.indexOf('From') > -1 ) {
                    textContainer.push(step1.split('From')[0].replace('g', '').trim());
                } else {
                    textContainer.push(step1 + 'days');
                }
                first = indexContainer[i];
            }
            
            return textContainer;
        } // end of getMeetingDay
        
        
        
        function getMeetingTime (string, target, a) {
            var indexContainer = findTargetLocation(string, target);
            
            var first = 0;
            var textContainer = [];
            
            if (indexContainer.length == 0) {
                var indexContainer2 = findTargetLocation(string, 'Special Interest Topic');
                for (var i = 0; i < 2; i++) {
                    var second = indexContainer2[i];
                    var step1 = string.substring(first + a, second);
                    textContainer.push(step1.split('From')[1].trim());
                    first = indexContainer2[i];
                }
            } else {
                for (var i = 0; i < indexContainer.length; i++) { 
                    second = indexContainer[i];
                    step1 = string.substring(first + a, second);
                    
                    if (step1.indexOf(target) > -1 ) {
                        textContainer.push(step1.split('From')[1].split(target)[0].trim());
                    } else if ((step1.match(/From/g) || []).length > 1) {
                        textContainer.push(step1.split('AM')[2].split('From')[1].trim());
                    } else {
                        textContainer.push(step1.split('From')[1].trim());
                    }
                    
                    first = indexContainer[i];
                }
            }
            return textContainer;
        } // end of getMeetingTime
        
        function getMeetingType (string, target, a, callback) {
            var indexContainer = findTargetLocation(string, target);
            var first = 0;
            var textContainer = [];
            
            if (rawData.indexOf('=') ==  -1) {
                return textContainer = undefined; // !!! can't get multiple n/a
            } else {
                for (var i = 0; i < indexContainer.length; i++) { 
                    first = indexContainer[i];
                    var second = indexContainer[i + 1];
                    var step1 = rawData.substring(first + a, second);

                    if (step1.indexOf(target) > -1 ) {
                        // console.log('end ' + i + ': ' + step1.split('From')[0].replace('g', '').trim());
                        textContainer.push(step1.split('Type ')[1].split('ing')[0] + 'ing');
                    } 
                    
                    first = indexContainer[i + 1];
                }
                return textContainer;
            }
            
        } // end of getMeetingType
        
        function getMeetingInterest (string, target, a, callback) {
            var indexContainer = findTargetLocation(string, 'Meeting Type');
            var first = 0;
            var textContainer = [];
            
            if (rawData.indexOf(target) ==  -1) {
                 for (var i = 0; i < indexContainer.length; i++) { 
                    return textContainer = 'wait';
                }
            } else if (rawData.indexOf(target) > -1) {
                
                for (var i = 0; i < indexContainer.length; i++) { 
                    var second = indexContainer[i];
                    var step1 = string.substring(first + a, second);
                  
                    if (step1.indexOf('Interest') == -1) { //if interest not present
                        // console.log('0: ' + undefined);
                        textContainer.push(undefined);
                        
                    } else { //if interest exists
                        step1 = step1.split('Interest')[1];
                        
                        if (step1.indexOf('Wednesdays') > -1) {
                            textContainer.push((step1.substring(0, step1.indexOf('days') - 6)).trim());
                        } else if (step1.indexOf('days') > -1) {
                            textContainer.push((step1.substring(0, step1.indexOf('days') - 5)).trim());
                        }
                    }
                    first = indexContainer[i];
                }
                return textContainer;
            }
            
        } // end of getMeetingInterest
        
        
        function findTargetLocation (string, target) {
            var indexContainer = [];
            var index = string.indexOf(target);
            while (index >= 0) {
                indexContainer.push(index);
                index = string.indexOf(target, index + 1);
            }
            return indexContainer;
        } // end of findtargetLocation func
            
    }); //end of tbody

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
var meeting28 = {};

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
testRun(meeting10, 10);
testRun(meeting11, 11);
testRun(meeting12, 12);
testRun(meeting13, 13);
testRun(meeting14, 14);
testRun(meeting15, 15);
testRun(meeting16, 16);
testRun(meeting17, 17);
testRun(meeting18, 18);
testRun(meeting19, 19);
testRun(meeting20, 20);
testRun(meeting21, 21);
testRun(meeting22, 22);
testRun(meeting23, 23);
testRun(meeting24, 24);
testRun(meeting25, 25);
testRun(meeting26, 26);
testRun(meeting27, 27);
testRun(meeting28, 28);
    
function testRun (meetingNumber, a){
    
    for (var i = 0; i < dataCategory.length; i++) { 
        
        var currentCategory = dataCategory[i];
        if ( i == 0) {
            meetingNumber[currentCategory] = locationName[a];
        } else if (i == 1) {
            meetingNumber[currentCategory] = groupName[a];
        } else if (i == 2) {
            meetingNumber[currentCategory] = address1[a];
        } else if (i == 3) {
            meetingNumber[currentCategory] = address1Detail[a];
        } else if (i == 4) {
            meetingNumber[currentCategory] = meetingNotes[a];
        } else if (i == 5) {
            meetingNumber[currentCategory] = meetingAccess[a];
        } else if (i == 6) {
            meetingNumber[currentCategory] = meetingDay[a];
        } else if (i == 7) {
            meetingNumber[currentCategory] = meetingTime[a];
        } else if (i == 8) {
            meetingNumber[currentCategory] = meetingType[a];
        } else if (i == 9) {
            meetingNumber[currentCategory] = meetingInterest[a];
        } 
    }
}