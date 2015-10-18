var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var addressLine1 = [];
var addressLine1Detail = [];
var addressLine2 = [];
var addressZipcode = [];

getData (addressLine1, 0, 2, 'address 1');
getData (addressLine1Detail, 0, 2, 'address 1 detail');
getData (addressLine2, 0, 3, 'address 2');
getData (addressZipcode, 0, 3, 'zipcode');

// console.log(addressLine1Detail);
// console.log(addressLine1);
console.log(addressLine2);
// console.log(addressZipcode);

function getData (item, column, section, note) {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
        rawData = $(elem).find('td').eq(column).html().split('<br>')[section].trim();
        
        if (note == 'address 1') { // Meeting Address Line 1, Street
            cleanUp1 = rawData.replace('(', ',');
            finalData = cleanUp1.substring(0, cleanUp1.indexOf(',')); // + ', New York, NY')
        } else if (note == 'address 1 detail') { // Meeting Address Line 1, Detail
            cleanUp1 = rawData.replace('(', ',');
            finalData = cleanUp1.split(',')[1].split('100')[0].trim(); // + ', New York, NY')
        } else if (section == 3) {
            if (note == 'address 2') {
                finalData = rawData;
            } else if (note == 'zipcode') {
                finalData = rawData;
            }
        }
        
        item.push(finalData);
    });
}