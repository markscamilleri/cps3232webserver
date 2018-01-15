var PDF = require('pdfkit');
var blobStream  = require('blob-stream');

var printFileToPdf = function(file, res) {
    var doc = new PDF();
    var stream = doc.pipe(res);

    doc.image(file, 0, 15, {width: 300});
    doc.end();

    var toReturn;
    stream.onfinish(function(){
        var blob = stream.toBlob('application/pdf');
        var url = stream.toBlobURL('application/pdf');
    });

    return url
};

module.exports = printFileToPdf;