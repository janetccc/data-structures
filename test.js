var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/test.html');

var $ = cheerio.load(content);

//var main_table = $('table').attr('cellpadding', '5');


// console.log($('td').attr('width', '260px').children('h4').text());

// $('table').attr('cellpadding', '5px').each(function (i, elem){
//     // var a = $(elem).text();
//     // if ($(elem).children().children().attr('width', '260px')) {
//         var a = $(elem).find($('td').attr('width', '260px;')).text();
//         console.log(a.split('<br />')[2]);
//         // var c = '        this is a <br/> string      ';
//         // console.log(c.split('<br/>'));
//     // };
// });
// var spec_td = $('td').attr('width', '260px').text();

// console.log($('table').attr('cellpadding'));

if ($('table').attr('cellpadding') == '5px') {
    
    var a = $('h4').text();
    console.log(a);
} else {
    console.log('none')
}

// var a = $('table').attr('cellpadding', '5px').children('tbody').text();

// console.log($(a).children().first('thead').text());

// console.log($('table').attr('cellpadding','5').text());

// $('table').filter(function(i, el) {
//   // this === el 
//   return $(this).attr('cellpadding') === '5';
// }).attr('cellpadding')



// console.log($('table').attr('cellpadding'));