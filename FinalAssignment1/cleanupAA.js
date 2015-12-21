var fs = require('fs');
var cheerio = require('cheerio');

var root = '/home/ubuntu/workspace/';

var zoneFile = fs.readFileSync(root + 'data/sortedMeetingsAll.txt');

// var zoneFile = root + 'data/sortedMeetingsAll.txt';
// var content = JSON.parse(fs.readFileSync(zoneFile));

// var $ = cheerio.load(zoneFile);

// var text = $('body').text();

// var edited = [];
// edited.push(JSON.stringify(zoneFile));

// console.log();

clearBackslash(JSON.parse(zoneFile));

var cleaned;

function clearBackslash(input){
	var result = input;
	// result = result[0];
	result = result.replace(/\"/g, '"');
	result = result.replace(/\\/g, '');
	// result = result.replace('}","{', '?');
	// result = result.replace('8:00 AM', '?');
	console.log(result);

	fs.writeFileSync(root + 'data/cleanedMeetingsAll.txt', result);
    console.log('--file updated: finalObject > cleanedMeetingsAll.txt');
}

// var format = cleaned;
// // console.log(cleaned);
// console.log(format.replace('8:00 AM"', '?'));

// result = result.replace(':\\\\"', ':"');

// console.log(edited);
// console.log(result);

// console.log(result.replace('\\\\', ''));