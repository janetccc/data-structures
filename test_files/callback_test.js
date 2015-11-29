var async = require('async'); // npm install async
// var waterfall = require('async-waterfall');

// function do_a( callback ){
//   console.log( '`do_a`: this takes longer than `do_b`' );
//   // setTimeout( function(){
//   //   // simulate a time consuming function
//   //   console.log( '`do_a`: this takes longer than `do_b`' );
 
//   //   // if callback exist execute it
//   //   callback && callback();
//   // }, 3000 );
// }
 
// function do_b(){
//   console.log( '`do_b`: now we can make sure `do_b` comes out after `do_a`' );
// }

// test();

// function test() {
//   async.waterfall([
//     a1,
//     a2,
//     a3
//   ], function (err, result) {
//     // result now equals 'done' 
//     console.log('all done');
//   });
// }


// function a1 (callback){
//   for (var i = 0; i < 2; i++) { 
//     if (i == 1) {
//       console.log('step1.1');
//     } else {
//       console.log('step1.2');
//     }
//     // if callback exist execute it
//   }
//   callback(null);
// };
  
// function a2(callback){
//   console.log('step2');
//   callback(null);
// }

// function a3(callback){
//   setTimeout( function(){
//     // simulate a time consuming function
//     console.log('step3');
//     // if callback exist execute it
//     callback();
//   }, 1000 );
//   // arg1 now equals 'three' 
// }

var sample = ['jpeg', 'png', 'gif']

diffAreas(sample);

function diffAreas (array) {
  async.eachSeries(array, function(el, callback) {
    console.log('converting ' + el)
    callback();
  }, function (err) {
    console.log('finished');
  });
}

// function convert(){
//   console.log('converting')
// }