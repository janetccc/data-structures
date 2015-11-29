var request = require('request');
var fs = require('fs');
var async = require('async'); // npm install async
// var waterfall = require('async-waterfall');

var urlContainer = [];
var fileContainer = [];

createRawDataTxt();

function createRawDataTxt(){
  async.waterfall([
    createURL,
    createFileNames,
    getMeetingFromSite
  ], function (err, result) {
    // result now equals 'done' 
    console.log('obtaining all data from site to txt');
  });
}

function createURL (callback) { //create URL of aa website
  for (var i = 1; i < 11; i++) { 
    var url;
    if (i == 10) {
      url = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=' + i + '&borough=M';
    } else {
      url = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=0' + i + '&borough=M';
    }
    urlContainer.push(url);
  }
  console.log('created URL');
  callback();
}

function createFileNames (callback) { //create file name & location to save meeting data from website
  for (var i = 1; i < 11; i++) { 
    var file;
    if (i == 10) {
      file = '/home/ubuntu/workspace/data/aameeting' + i + 'M.txt';
    } else {
      file = '/home/ubuntu/workspace/data/aameeting0' + i + 'M.txt';
    }
    fileContainer.push(file);
  }
  console.log('created fileNames');
  callback(null);
}

function getMeetingFromSite (callback) { //get all meeting info from aa website
  for (var i = 0; i < urlContainer.length; i++) { 
    loadMeetingsData(urlContainer[i], fileContainer[i]);
  }
  console.log('got data from site');
  callback(null);
  
  function loadMeetingsData(url, fileLocation) {
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          fs.writeFileSync(fileLocation, body);
        }
        else {console.error('request failed')}
      });
    }
}