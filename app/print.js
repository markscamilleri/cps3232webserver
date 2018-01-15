var PDF = require('pdfkit');
var blobStream  = require('blob-stream');

var printFileToPdf = function(file, res) {
    var doc = new PDF();
    doc.pipe(res);

    doc.image(file, 0, 15, {width: 300});
    doc.end();
};

module.exports = {printFileToPdf: printFileToPdf};