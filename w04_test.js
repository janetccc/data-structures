var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

////load updated website data
// request('http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=02&borough=M', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     fs.writeFileSync('/home/ubuntu/workspace/data/aameeting02M_1003.txt', body);
//   }
//   else {console.error('request failed')}
// });

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M_1003.txt');

var $ = cheerio.load(content);

function getData (item, column, section, note) {
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var finalData = [];
        var cleanUp1 = [];
        
        if (note == 'meeting notes') {
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
        
        item.push(finalData);
    });
}

var locationName = [];
var groupName = [];
var addressLine = [];
var addressDetail = [];
var meetingNote = [];
var meetingAccess = [];

getData (locationName, 0, 0);
getData (groupName, 0, 1);
getData (addressLine, 0, 2, 'part1');
getData (addressDetail, 0, 2, 'part2');
getData (meetingNote, 0, null, 'meeting notes');
getData (meetingAccess, 0, null, 'meeting access');

console.log(meetingNote);

//new logic
//goal: put data in each of their individual meeting objects
//function
//  
//push into object
//