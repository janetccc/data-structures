var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var groupName = [];
var addressLine1 = [];

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

function getAddress (item, column, section, note) {
    var rawData = [];
    var cleanUp1;

    $('tbody').find('tr').each(function(a, elem){
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
        finalData = cleanUp1;
        item.push(finalData);
        
    });
}

getGroupName (groupName, 0, 1);
getAddress (addressLine1, 0, 2);

console.log(groupName);


// // check how strings are filtered
// console.log(first);
// console.log(second);
// console.log('use 2: ' + (first.length < second.length));
// console.log('use 1: ' + (first.length > second.length));
// console.log('use 1: ' + (first.length == second.length));
// console.log('------');