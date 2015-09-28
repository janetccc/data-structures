var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var meetings = [];

$('tbody').find('tr').each(function(i, elem){
    meetings.push($(elem).find('td').eq(0).html().split('<br>')[2].trim());
});

console.log(meetings)

//$('table[cellpadding=5]').each(function (i, elem){
    
// });


// for w3 assignment: finding address and adding NY to the end
// var meetings = [];

// $('tbody').find('tr').each(function(i, elem){
//     var a = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
//     var b = a.substring(0, a.indexOf(',')) + ', New York, NY';
//     meetings.push(b.split(' ').join('+'));
// });

// console.log(meetings);


// $('tbody').find('tr').each(function(i, elem){
//     meetings = $(elem).find('td').eq(0).html().split('<br>')[2].trim().replace('(', ',');
//     addresses.push(meetings.substring(0, meetings.indexOf(',')) + ', New York, NY');
// });