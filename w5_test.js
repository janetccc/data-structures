var meeting = "T&amp;A-TOGETHERNESS &amp; ACTION - "

meeting.indexOf('-');

var first = meeting.substr(0, meeting.indexOf('-') - 1) //returns LIVING NOW



//does 1st exist?
console.log(first.length);
console.log('first:' + first);

var second = meeting.substr(meeting.indexOf('-') + 2) //returns living Now

//does 2nd exist?
console.log(second.length);
console.log('second:' + second);


var final = second.substr(0, first.length);

console.log('second - first:' + final);

//1 if first is 
//if nothing after hypen, lose it
//if second is longer than the first
//if first is longer than second