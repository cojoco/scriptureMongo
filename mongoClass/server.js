var fs = require('fs');
var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
var readline = require('readline');
var ROOT_DIR = "html/";

http.createServer(function (req, res) {
 var urlObj = url.parse(req.url, true, false);
 // If this is our comments REST service
 if(urlObj.pathname.indexOf("comment") !=-1) {
  if(req.method === "GET") {
   var userQuery = url.parse(req.url, true).query;
   console.log(userQuery);
   MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if (err) throw err;
    db.collection("comments", function(err, comments) {
     if (err) throw err;
     comments.find(userQuery,function(err, items) {
      items.toArray(function(err, itemArr) {
       res.writeHead(200);
       res.end(JSON.stringify(itemArr));
      });
     });
    });
   });
  }
  else if(req.method === "POST") {
   var jsonData = "";
   req.on('data', function(chunk) {
    jsonData += chunk
   });
   req.on('end', function () {
    var reqObj = JSON.parse(jsonData);
    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
     if (err) throw err;
     db.collection('comments').insert(reqObj,function(err, records) {
      res.writeHead(200);
      res.end("");
     });
    });
   });
  }
 }
 else {
  // Normal static file
  fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
   if (err) {
    res.writeHead(404);
    res.end(JSON.stringify(err));
    return;
   }
  res.writeHead(200);
  res.end(data);
  });
 }
}).listen(3000);