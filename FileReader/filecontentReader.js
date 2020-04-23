var fs = require('fs');
var PdfReader = require("pdfreader").PdfReader;
var filereader = require('./filereader');

module.exports.readFilesHandler = function (file, res){
    return new Promise((resolve, reject)=>{
        var filecontent = "";
        fs.readFile(file.path, (err, data) => {
            let filePath = file.path;
            let filebuffer = data;
            let filename = file.name;
            var fileextension = filereader.getFileExtension(filename);
            switch (fileextension) {
                case '.pdf':
                    new PdfReader().parseBuffer(filebuffer, function (err, item) {
                        if (err) reject(err);
                        else if (!item) resolve(filecontent);
                        else if (item.text) {
                            filecontent = filecontent + " " + item.text;
                        }
                    });
                    break;
                case '.docx':
                    filereader.extract(filePath).then(function (res, err) {
                        if (err) reject(err);
                        filecontent = res;
                        resolve(filecontent);
                    });
                    break;
                case '.txt' || '.csv':
                    filecontent = data;
                    resolve(filecontent);
                    break;
                default:
                    reject({"message":"File non supportato"});
                    break;
            }
        });
    });
};