var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('/home/ubuntu/workspace/data/aameeting02M.txt');

var $ = cheerio.load(content);


$('table').each(function (i, elem){
    
    //select desired table
    if ($(elem).attr('cellpadding') == '5') {
    
        //find left tr using h4
        $(elem).find('h4').each(function (i, elem){
            
            //return to parent tr & filter out all tags (h4, b, div, span) in the tr
            var raw_address = $(elem).parent().contents().not('h4').not('b').not('div').not('span').not(/\t/);
            //get rid of extra space
            var final_address = [raw_address.text().trim().replace(/\t/g, '/').split('//////')[0]];
            
            console.log(final_address[0]);
            
        });
    }
});