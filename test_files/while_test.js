var rawData = "Sundays From 12:30 PM to 1:30 PM Meeting Type O = Open meeting  Special Interest Gay, Lesbian and Bisexual  Wednesdays From 6:30 PM to 7:30 PM Meeting Type B = Beginners meeting Special Interest Gay, Lesbian and Bisexual Fridays From 7:30 PM to 8:30 PM Meeting Type B = Beginners meeting Special Interest Gay, Lesbian and Bisexual";
var finalData = [];




var indexContainer = [];


finalData = findtargetLocation(rawData, 'Meeting Type');

var first = 0;
var a = 0;
var target = 'Special Interest'
var textContainer = [];


if (rawData.indexOf('Special Interest') ==  -1) {
    // console.log('none');
    // console.log(rawData)
    finalData = '';
} else {
    for (var i = 0; i < indexContainer.length; i++) { 
    first = indexContainer[i];
    var second = indexContainer[i + 1];
    var step1 = rawData.substring(first + a, second);
    
    if (step1.indexOf(target) > -1 ) {
        // console.log('end ' + i + ': ' + step1.split('From')[0].replace('g', '').trim());
        step1 = step1.replace('Special Interest', '');
        if (step1.indexOf('Wednesdays') > -1) {
            step1 = step1.split('meeting')[1];
            textContainer.push(step1.substring(0, step1.indexOf('days') - 6).trim());
        } else if (step1.indexOf('days') > -1) {
            step1 = step1.split('meeting')[1];
            textContainer.push(step1.substring(0, step1.indexOf('days') - 4).trim());
        } else {
            step1 = step1.split('meeting')[1]
            textContainer.push(step1.trim());    
        }
        
    } 
    
    first = indexContainer[i + 1];
}

finalData = textContainer;
}



console.log(finalData);

function findtargetLocation (string, target) {
    
    var index = string.indexOf(target);
    
    while (index >= 0) {
        indexContainer.push(index);
        index = string.indexOf(target, index + 1);
    }
}
    
    
    



// function findtargetLocation (string, target, a) {
//     var indexContainer = [];
//     var index = string.indexOf(target);
    
//     while (index >= 0) {
//         indexContainer.push(index);
//         index = string.indexOf(target, index + 1);
//     }
    
//     var first = 0;
//     var textContainer = [];
    
//     for (var i = 0; i < indexContainer.length; i++) { 
//         var second = indexContainer[i];
//         var step1 = rawData.substring(first + a, second);
        
//         if (step1.indexOf(target) > -1 ) {
//             // console.log('end ' + i + ': ' + step1.split('From')[0].replace('g', '').trim());
//             textContainer.push(step1.split('From')[1].split('Meeting Type')[0].trim());
//         } else {
//             textContainer.push(step1.split('From')[1].trim());
//         }
        
//         first = indexContainer[i];
//     }
    
//     return textContainer;
// }
    
// console.log(indexContainer);
