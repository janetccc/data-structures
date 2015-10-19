var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);

var finalData = [];
var finalObject = {};
var locationName = [];
var groupName = [];
var addressLine1 = [];
var addressLine1Detail = [];
var addressLine2 = [];
var meetingNotes = [];
var meetingAccess = [];
var meetingTime = [];

var dataCategory = ['locationName', 'groupName', 'addressLine1', 'addressLine1Detail', 'addressLine2', 'meetingNotes', 'meetingAccess', 'meetingTime'];


getData (locationName, 0, 0);
getData (groupName, 0, 1);
getData (addressLine1, 0, 2, 'address 1');
getData (addressLine1Detail, 0, 2, 'address 1 detail');
getData (addressLine2, 0, 3, 'address 2');
getData (meetingNotes, 0, null, 'meeting notes');
getData (meetingAccess, 0, null, 'meeting access');
getData (meetingTime, 1, null, 'meeting time');


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
finalObject = [testRun(meeting0, 0), testRun(meeting1, 1), testRun(meeting2, 2), testRun(meeting3, 3), testRun(meeting4, 4), testRun(meeting5, 5), testRun(meeting6, 6), testRun(meeting7, 7), testRun(meeting8, 8), testRun(meeting9, 9), testRun(meeting10, 10), testRun(meeting11, 11), testRun(meeting12, 12), testRun(meeting13, 13), testRun(meeting14, 14), testRun(meeting15, 15), testRun(meeting16, 16), testRun(meeting17, 17), testRun(meeting18, 18), testRun(meeting19, 19), testRun(meeting20, 20), testRun(meeting21, 21), testRun(meeting22, 22), testRun(meeting23, 23), testRun(meeting24, 24), testRun(meeting25, 25), testRun(meeting26, 26), testRun(meeting27, 27)];
/////////step1 complete///////

var dbName = 'aa';
var collName = 'area02M';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb

// MongoClient.connect(url, function(err, db) {
//     if (err) {return console.dir(err);}
// //I created a document called "meetings" inside the "aameetings" database
//     var collection = db.collection(collName);

//     // put the meetings data we have into the database
//     collection.insert(finalObject);
//     db.close();

// });


MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);

    collection.aggregate(
        [
            { $match: { $text: { $search: "Tuesdays" } } },
            // { $sort: { score: { $meta: "textScore" } } },
        ]
    ).toArray(function(err, docs) {
    // collection.aggregate([{ $limit : 3 }]).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            console.log(docs);
        }
        db.close();
        
    });

}); //MongoClient.connect



///////step1 functions////////

function getData (item, column, section, note) {
    
    //parse all data
    $('tbody').find('tr').each(function(a, elem){
        var rawData = [];
        var cleanUp1 = [];
        
        if (column == 1) { ////// Meeting day, time & type 
            //if not splitting time & meeting type
            var string = $(elem).find('td').eq(column).text().trim();
            var target = 'days';
            var indexContainer = findTargetLocation(string, target);
            var textContainer = [];
            
            for (var i = 0; i < indexContainer.length; i++) { 
                first = indexContainer[i];
                var second = indexContainer[i + 1];
                var step1 = string.substring(first - 7, second);

                if (step1.indexOf(target) > -1 ) {
                    textContainer.push(step1.split(/\t/)[0].trim());
                } else {
                    textContainer.push(step1);
                }
                
                finalData = textContainer;
                first = indexContainer[i + 1];
            }
        
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
                
            } else if (section == 3) { ////// Meeting Address Line 2
                    finalData = rawData.split('100')[0].replace('NY', '').trim();
                
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
        
        
        function findTargetLocation (string, target) {
            var indexContainer = [];
            var index = string.indexOf(target);
            while (index >= 0) {
                indexContainer.push(index);
                index = string.indexOf(target, index + 1);
            }
            return indexContainer;
        } // end of findtargetLocation func
        
    }); // end of tbody

}

function testRun (meetingNumber, a){
    for (var i = 0; i < dataCategory.length; i++) { 
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
            meetingNumber[currentCategory] = addressLine2[a];
        } else if (i == 5) {
            meetingNumber[currentCategory] = meetingNotes[a];
        } else if (i == 6) {
            meetingNumber[currentCategory] = meetingAccess[a];
        } else if (i == 7) {
            meetingNumber[currentCategory] = meetingTime[a];
        } 
    }
    return meetingNumber;
}