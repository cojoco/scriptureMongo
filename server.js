var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var readline = require('readline');
var MongoClient = require('mongodb').MongoClient;
var request = require("request")
var mkdirp = require('mkdirp');
var app = express();
var options = {
    host: '52.88.191.100',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(3004);

app.get('/download-scriptures', function (req, res) {

    var testaments = [
        "ot",
        "nt",
        "bm",
        "dc",
        "pgp"
    ];

    var jsonFile;
    testaments.forEach(function(testament) {
        var url = "http://scriptures.desh.es/api/v1/" + testament;
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var books = body.books;
                fs.chmod("scriptures", 0777);
                fs.writeFile("scriptures/" + testament + ".json", JSON.stringify(body), function(err) {
                    if(err) {
                        console.log(err);
                    }
                    console.log("Saved: " + testament);
                }); 

                books.forEach(function(book) {
                    getBook(testament, book);
                });

            }
        });
    });
    
    res.send(JSON.stringify(jsonFile));
});

var getBook = function(testament, book) {
    var url = "http://scriptures.desh.es/api/v1/" + testament + "/" + book.slug;
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            mkdirp("scriptures/" + testament, function(err) {console.log(err);});
            fs.chmod("scriptures/" + testament, 0777);
            fs.writeFile("scriptures/" + testament + "/" + book.slug + ".json", JSON.stringify(body), function(err) {
                if(err) {
                    console.log(err);
                }

                console.log("Saved: " + book.slug);
            }); 
            getChapter(testament, book, book.chapters);
            jsonFile = body;
        }
    });
}


var getChapter = function(testament, book, chapters) {
    for(var chapter = 0; chapter < chapters; ++chapter) {
        var url = "http://scriptures.desh.es/api/v1/" + testament + "/" + book.slug + "/" + chapter;
        console.log(url);
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                mkdirp("scriptures/" + testament + "/" + book.slug, function(err) {console.log(err);});
                fs.chmod("scriptures/" + testament + "/" + book.slug, 0777);
                fs.writeFile("scriptures/" + testament + "/" + book.slug + "/" + chapter + ".json", JSON.stringify(body), function(err) {
                    if(err) {
                        console.log(err);
                    }

                    console.log("Saved: " + chapter);
                }); 
            }
            else {
                console.log(error);
            }
        });
    }
}