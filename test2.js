var fs = require('fs');

var a = ['testing now', 'here', 'more'];

fs.writeFileSync('/home/ubuntu/workspace/data/meetings_geodata.txt', a);