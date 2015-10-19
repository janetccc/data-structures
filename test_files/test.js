var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
// var finalObject = {};
var meetingDay = [];
var meetingTime = [];
var meetingType = [];
var meetingInterest = [];

var dataCategory = ['locationName', 'groupName', 'address1', 'address1Detail', 'meetingNotes', 'meetingAccess', 'meetingTime'];

getData();

console.log(meetingInterest.length);

function getData () {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
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
                    var second = indexContainer[i];
                    var step1 = string.substring(first + a, second);
                    
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
            var indexContainer = findTargetLocation(string, target);
            var first = 0;
            var textContainer = [];
            var counter = 0;
            counter = counter + 1;
            console.log(counter);
            if (rawData.indexOf(target) ==  -1) {
                // return textContainer = 'n/a';
                var step1 = ('n/a');
            } else if (rawData.indexOf(target) >  -1) {
                for (var i = 0; i < indexContainer.length; i++) { 
                    first = indexContainer[i];
                    var second = indexContainer[i + 1];
                    // console.log(second);
                    var step1 = rawData.substring(first + a, second);
                    // console.log('*' + step1 + '------')
                    // console.log(i);
                    // console.log('1: ' + step1.indexOf('Interest') == -1);
                    // console.log('2: ' + step1.indexOf('Wednesdays') > -1);
                    // console.log('3: ' + step1.indexOf('days') > -1);
                        
                        if (step1.indexOf('Interest') == -1) {
                            return textContainer = 'n/a';   
                        } else {
                            step1 = step1.replace('Special Interest', '');
                            if (step1.indexOf('Wednesdays') > -1) {
                                // console.log('pre: ' + step1);
                                step1 = step1.substring(0, step1.indexOf('days') - 6).trim();
                                // console.log('post: ' + step1);
                            } else if (step1.indexOf('days') > -1) {
                                step1 = step1.substring(0, step1.indexOf('days') - 5).trim();
                            }
                            // textContainer.push(step1.trim());   
                            
                        }
                     
                    // console.log(step1.trim());
                
                    first = indexContainer[i + 1];
                }
                textContainer.push(step1.trim());   
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