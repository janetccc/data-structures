var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var groupName = [];

function getGroupName (item, column, section, note) {
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        // parse target data
        rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim();
        cleanUp1 = rawData.split('>')[1].split('<')[0].toUpperCase();
        var first = cleanUp1.substr(0, cleanUp1.lastIndexOf('-') - 1); // before -
        var second = cleanUp1.substr(cleanUp1.lastIndexOf('-') + 2); // after -
        
        if (first.length < second.length) { // if second is full name
            
            if (second.indexOf('I)') > -1) { // if there is a number, clear the number
                finalData = second.substr(0, first.length);
            } else if (second.indexOf('AHEAD') > -1) { // exceptions: women straight ahead sat
                finalData = first + ' - ' + second;
            } else { // if there is no number, use second
                finalData = second;
            }
            
        } else if (first.length > second.length) { // if first is full name
        
            if (first.indexOf('-') > -1) { // if - still exists, take what is after - (targeting T&A)
                var cleanUp2 = first.split('-')[1];
                finalData = cleanUp2;
            } else if (first.indexOf('I') > -1) { // if number exists, clear number
            
                if (first.indexOf('ROOM') > -1) { // exceptions
                    finalData = first;   
                } else {
                    finalData = first.split('(')[0].trim();
                }
                
            } else { // if - does not exist, use first
                finalData = first;
            }
            
        } else if (first.length == second.length) { // if both are same
            finalData = first;
        }
        
        item.push(finalData.toUpperCase());
    });
}

getGroupName (groupName, 0, 1);

console.log(groupName);


// // check how strings are filtered
// console.log(first);
// console.log(second);
// console.log('use 2: ' + (first.length < second.length));
// console.log('use 1: ' + (first.length > second.length));
// console.log('use 1: ' + (first.length == second.length));
// console.log('------');