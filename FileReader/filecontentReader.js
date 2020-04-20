var fs = require('fs');
var PdfReader = require("pdfreader").PdfReader;
var filereader = require('./filereader');
var XLSX = require('xlsx');
module.exports.readFilesHandler = function (file, res){
    return new Promise((resolve, reject)=>{
        var filecontent = "";
        fs.readFile(file.path, (err, data) => {
            console.log(err);
            let filePath = file.path;
            let filebuffer = data;
            let filename = file.name;
            var fileextension = filereader.getFileExtension(filename);
            switch (fileextension) {
                case '.pdf':
                    new PdfReader().parseBuffer(filebuffer, function (err, item) {
                        if (err) console.log(err);
                        else if (!item) console.log(item);
                        else if (item.text) {
                            filecontent = filecontent + " " + item.text;
                        }
                    });
                    break;
                case '.docx':
                    filereader.extract(filePath).then(function (res, err) {
                        if (err) { console.log("ErroreDocx: " + err); }
                        filecontent = res;
                        resolve(filecontent);
                    });
                    break;
                case '.xlsx' || '.xls':
                    var result = {};
                    data = new Uint8Array(data);
                    var workbook = XLSX.read(data, {
                        type: 'array'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                            header: 1
                        });
                        if (roa.length) result[sheetName] = roa;
                    });
                    filecontent = JSON.stringify(result);
                    break;
                case '.txt' || '.csv':
                    filecontent = data;
                default:
                    filecontent = filename;
            }
        });
    });
};