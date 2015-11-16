var pg = require('pg');

// add connection string here
var conString = "postgres://janet:newyorkny@data-structures-janet.clvorhidqxm5.us-east-1.rds.amazonaws.com:5432/postgres";

// var five = require("johnny-five"), bumper, led, exitBumper; 

var five = require("johnny-five");
var count = 0;
var timestamp =  Date().toString();

five.Board().on("ready", function() {
  
  var piezoA = new five.Sensor({
    pin: 'A0',
    freq: 10,
    threshold: 5,
  });

  piezoA.scale(0, 10).on("change", function() { 
    var sensorVal = this.value;
    var sensorState = false;

    console.log('sensorVal: ' + sensorVal);

    console.log('knocked ' + Date().toString() + ' ' + this.value);

    if (sensorVal >= 0) {
      sensorState == true;
    } else if (sensorVal == 0) {
      sensorState == false;
    }

    console.log('sensorState: ' + sensorState);

    // pg.connect(conString, function(err, client, done) {
    //   if(err) {
    //     return console.error('error fetching client from pool', err);
    //   }

    //   client.query("INSERT INTO sensor VALUES (" + sensorState + ", DEFAULT);", function(err, result) {
    //     //call `done()` to release the client back to the pool
    //     done();

    //     if(err) {
    //       return console.error('error running query', err);
    //     }
    //     console.log(result);
    //   });

    // });

    // console.log('knocked ' + Date().toString() + ' ' + this.value);
    // buzzer();
  });

});