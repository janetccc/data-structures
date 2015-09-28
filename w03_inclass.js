// var apiKey= process.env.API_KEY;

// var URLtoParse = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAvZ4L2U8ZY5e7yf1jl3FG49cUjcYyFNAk' + apiKey;

// console.log(URLtoParse)

var async = require('async');

var names = ["Alex", 'Betsy', 'Chris', 'Diana'];

// for (var i=0; i < names.length; i++) {
//     console.log(names[i]);
// }

//array, function for each value, optional callback func
//callback = next step
async.eachSeries(names, function(value, callback){
    console.log(value);
    setTimeout(callback, 2500);
}, function(){
    console.log("we're done with the whole thing!");
});

// function y (){
//     console.log("WHY??????")
// }

// setTimeout(y, 5000);
