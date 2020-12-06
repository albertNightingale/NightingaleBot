const path = require('path');


module.exports = {
    'inputfile': path.join(__dirname, '/resources/text/input.txt'),
    'outputfile': path.join(__dirname, '/resources/text/output.txt'),  
    'attachmentsizelimit': 25000,                                           // the file size limit
}