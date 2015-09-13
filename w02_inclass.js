var fs = require('fs');
var cheerio = require('cheerio');

var fileContent = fs.readFileSync('/home/ubuntu/workspace/data/syllabus.txt'); //read file, working on local text file to not requesting from other server multiple times

var $ = cheerio.load(fileContent); //$ is easy when it's going to be used over and over again

//.each iterates cheerio object, then runs callback function(index, element)
$('h4').each(function(i, elem) {
  //($(elem).text()); //take each element and pull out the text
  
  if ($(elem).text() == "Read") { //finds all text that equals Read
    $(elem).next().find('li').each(function(i, elem) {
      console.log($(this).text());  //can calls elem, or elem2, or this(what is infront of you)
    }); //next chooses next element; find li
  }
});

// .trim() - method that gets rid of all leading and ending spaces

// var a = "                     Why are all these spaces here!?                  "
// a = "                     Why are all these spaces here!?                  "
// a.trim() = "Why are all these spaces here!?"