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
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(3000);
https.createServer(options, app).listen(5001);

app.get('/populateMongoWithScriptures', function (req, res) {
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
        fs.readFile("scriptures/" + testament + ".json", 'utf8', function(err, data) {
            if(err) {
                throw err;
            }

            var books = JSON.parse(data).books;
            addJSONToMongo(JSON.parse(data));
            books.forEach(function(book) {
                bookFileToMongo(testament, book);
            });
        });
    });

    res.send(JSON.stringify(jsonFile));
});

var bookFileToMongo = function(testament, book) {
    fs.readFile("scriptures/" + testament + "/" + book.slug + ".json", 'utf8', function(err, data) {
        if(err) {
            throw err;
        }

        addJSONToMongo(JSON.parse(data));
        chapterFileToMongo(testament, book, book.chapters);
    });
}


var chapterFileToMongo = function(testament, book, chapters) {
    for(var chapter = 1; chapter <= chapters; chapter++) {
        chapterFileToMongoRequest(testament, book, chapter);
    }
}

var chapterFileToMongoRequest = function(testament, book, chapter) {
  fs.readFile("scriptures/" + testament + "/" + book.slug + "/" + chapter + ".json", 'utf8', function(err, data) {
    if(err) {
        throw err;
    }

    addJSONToMongo(JSON.parse(data));

  });
}

var addJSONToMongo = function(body) {
    MongoClient.connect("mongodb://localhost/scriptures", function(err, db) {
      if(err) throw err;
      db.collection('scriptures').insert(body,function(err, records) {
        console.log("Record added as "+records[0]._id);
      });
    });
}


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
                fs.chmod("scriptures", 0755);
                fs.writeFile("scriptures/" + testament + ".json", JSON.stringify(body), function(err) {
                    if(err) {
                        console.log(err);
                    }
                    console.log("Saved: " + testament);
                });

                books.forEach(function(book) {
                    saveBookToFile(testament, book);
                });

            }
        });
    });

    res.send(JSON.stringify(jsonFile));
});

var saveBookToFile = function(testament, book) {
    var url = "http://scriptures.desh.es/api/v1/" + testament + "/" + book.slug;
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            mkdirp("scriptures/" + testament, function(err) {console.log(err);});
            fs.chmod("scriptures/" + testament, 0755, function(err) {if(err) {console.log(err);}});
            fs.writeFile("scriptures/" + testament + "/" + book.slug + ".json", JSON.stringify(body), function(err) {
                if(err) {
                    console.log(err);
                }

                console.log("Saved: " + book.slug);
            });
            saveChapterToFile(testament, book, book.chapters);
            jsonFile = body;
        }
    });
}


var saveChapterToFile = function(testament, book, chapters) {
    for(var chapter = 1; chapter <= chapters; chapter++) {
        chapterFileRequest(testament, book, chapter);
    }
}

var chapterFileRequest = function(testament, book, chapter) {
  var url = "http://scriptures.desh.es/api/v1/" + testament + "/" + book.slug + "/" + chapter;
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          mkdirp("scriptures/" + testament + "/" + book.slug, function(err) {console.log(err);});
          fs.chmod("scriptures/" + testament + "/" + book.slug, 0755, function(err) {console.log(err);});
          fs.writeFile("scriptures/" + testament + "/" + book.slug + "/" + chapter + ".json", JSON.stringify(body), function(err) {
              if(err) {
                  console.log(err);
              }

              console.log("Saved: " + book.title + " " + chapter);
          });
      }
      else {
          console.log(error);
      }
  });
}
