var pg = require('pg');

// add connection string here
var conString = "postgres://janet:newyorkny@data-structures.ceea2ymizbfi.us-west-2.rds.amazonaws.com:5432/postgres";

var five = require("johnny-five");
// var timestamp =  Date().toString();

five.Board().on("ready", function() {
  
  var piezoA = new five.Sensor({
    pin: 'A0',
    freq: 10,
    threshold: 5,
  });

  piezoA.scale(0, 10).on("change", function() { 
    var sensorVal = this.value;

    console.log('sensorVal: ' + sensorVal + '; time: ' + Date().toString() + ' ' + this.value);

    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      client.query("INSERT INTO sensor VALUES (" + sensorVal + ", DEFAULT);", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
      });

    });

  });

});