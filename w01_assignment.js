var request = require('request');
var fs = require('fs');

loadMeetingsData('http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=02&borough=M', 'aameeting02M.txt');

function loadMeetingsData(url, fileLocation) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      fs.writeFileSync('/home/ubuntu/workspace/data/' + fileLocation, body);
    }
    else {console.error('request failed')}
  })
}

