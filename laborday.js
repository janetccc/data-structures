var request = require('request'); //getting request module, pre-written module
var fs = require('fs'); //file system module, saves the file

//request function, from the module
request('http://visualizedata.github.io/datastructures/', function (error, response, body) { //gets info from site, then next step after step 1 is done
  if (!error && response.statusCode == 200) { //if there is no error, and response= 200 (status code), then 
    fs.writeFileSync('/home/ubuntu/workspace/data/syllabus.txt', body); //use file system module to write new file in the body
  }
  else {console.error('request failed')}
})


//request function (site, what to do with it after)