var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
// var finalObject = {};
var locationName = [];
var groupName = [];
var addressLine1 = [];
var addressLine1Detail = [];
var meetingNotes = [];
var meetingAccess = [];
var meetingTime = [];
// var meetingType = [];

var dataCategory = ['locationName', 'groupName', 'addressLine1', 'addressLine1Detail', 'meetingNotes', 'meetingAccess', 'meetingTime'];


getData (locationName, 0, 0);
getData (groupName, 0, 1);
getData (addressLine1, 0, 2, 'address 1');
getData (addressLine1Detail, 0, 2, 'address 1 detail');
getData (meetingNotes, 0, null, 'meeting notes');
getData (meetingAccess, 0, null, 'meeting access');
getData (meetingTime, 1, null, 'meeting time');
// getData (meetingType, 1, null, 'meeting type');

// console.log(meetingAccess);

function getData (item, column, section, note) {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
        if (column == 1) { ////// Meeting day, time & type 
            //if not splitting time & meeting type
            finalData = $(elem).find('td').eq(column).text().trim();
        
        } else if (note == 'meeting notes') { ////// Meeting Notes
            finalData = $(elem).find('div').text().replace('*', '').trim();
        
        } else if (note == 'meeting access'){ ////// Meeting Accessibility
            finalData = $(elem).find('span').eq(column).text().trim();
            // console.log(finalData.indexOf('Wheelchair access') > -1);

        } else if (column == 0) {
            rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim();
            
            if (section == 2) { ////// Address Line 1
            
                if (note == 'address 1') { // Meeting Address Line 1, Street
                    rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim().replace('(', ',');

                    if (rawData.indexOf('Strert') > -1) { // Correct Spelling
                        rawData = rawData.replace('Strert', 'Street');
                    } else if (rawData.indexOf('W.') > -1) { // Change format, for consistency
                        rawData = rawData.replace('W.', 'West');
                    } else if (rawData.indexOf('Bowery Street') > -1) { // Change format, for consistency 
                        rawData = rawData.replace(' Street', '').substring(0, rawData.indexOf(',')).trim();
                    }
                    cleanUp1 = rawData.substring(0, rawData.indexOf(','));
                    
                    var city = ', New York, NY';
                    finalData = (cleanUp1 + city);

                } else if (note == 'address 1 detail') { ////// Meeting Address Line 1, Detail
                    cleanUp1 = rawData.replace('(', ',');
                    finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
                }
                
            } else if (section == 1) { ////// Group Name

                rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim();
                cleanUp1 = rawData.split('>')[1].split('<')[0].toUpperCase();
                var first = cleanUp1.substr(0, cleanUp1.lastIndexOf('-') - 1); // before -
                var second = cleanUp1.substr(cleanUp1.lastIndexOf('-') + 2); // after -
                
                if (first.length < second.length) { // if second is full name
                    
                    if (second.indexOf('I)') > -1) { // if there is a number, clear the number
                        second = second.substr(0, first.length);
                    } else if (second.indexOf('AHEAD') > -1) { // exceptions: women straight ahead sat
                        second = first + ' - ' + second;
                    }
                    
                    finalData = second;
                    
                } else if (first.length > second.length) { // if first is full name
                
                    if (first.indexOf('-') > -1) { // if - still exists, take what is after - (targeting T&A)
                        var cleanUp2 = first.split('-')[1];
                        finalData = cleanUp2;
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
            
            } else if (section == 0) { ///// Location Name
                finalData = rawData.split('>')[1].split('<')[0].split(' -')[0].split('100')[0];
            } 
        }
        item.push(finalData);
        
    });

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
            meetingNumber[currentCategory] = addressLine1[a];
        } else if (i == 3) {
            meetingNumber[currentCategory] = addressLine1Detail[a];
        } else if (i == 4) {
            meetingNumber[currentCategory] = meetingNotes[a];
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



  // for (i = 0; i < finalData.length; i++) { 
       
    // }
    
    //push from array into objects


            // rawData = $(elem).find('td').eq(column).text();
            // if (item == 'meetingTime') {
            //     cleanUp1 = rawData.replace('Meeting', '+');
            //     console.log(cleanUp1);
            //     if (cleanUp1.indexOf("AM") < -1) {   
            //     // if (rawData.indexOf("AM") > -1) {   
            //         finalData = cleanUp1;
            //     } else {
                    
            //     }
            // } else if (item == 'meeting type') {
            //     console.log(rawData.indexOf('Meeting'));
            //     finalData = rawData;
            // }
                
                
                //if split via indexOf??
            //rawData = $(elem).find('td').eq(column).text();
            // if (item == 'meetingTime') {
                // finalData = rawData.substring(0, rawData.indexOf('Meeting')).trim();
            // } else if (item == 'meeting type') {
            //     console.log(rawData.indexOf('Meeting'));
            //     finalData = rawData;
            // }