var fs = require('fs');
var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
var readline = require('readline');
var ROOT_DIR = "html"; 

http.createServer(function (req, res) {
 var urlObj = url.parse(req.url, true, false);
 // If this is our todos REST service
 if(urlObj.pathname === "/todo") {
  if(req.method === "GET") {
   var userQuery = url.parse(req.url, true).query;
   console.log(userQuery);
   MongoClient.connect("mongodb://localhost/todos", function(err, db) {
    if (err) throw err;
    db.collection("todos", function(err, todos) {
     if (err) throw err;
     todos.find(userQuery,function(err, items) {
      items.toArray(function(err, itemArr) {
       res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-54-148-248-229.us-west-2.compute.amazonaws.com" });
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
    MongoClient.connect("mongodb://localhost/todos", function(err, db) {
     if (err) throw err;
     db.collection('todos').insert(reqObj,function(err, records) {
      res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-54-148-248-229.us-west-2.compute.amazonaws.com" });
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
  res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-54-148-248-229.us-west-2.compute.amazonaws.com" });
  res.end(data);
  });
 }
}).listen(3000);
