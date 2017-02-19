"use strict";

let express = require("express");
let app = express();
let http = require("http").Server(app);
let PORT_NUMBER = 3000;
let request = require("request");
let bodyParser = require('body-parser');
let baseUrl = "https://EMtjAqbj250UcrIEIhahPuIzlKjnGp8QvKv1PrtC:X@bibles.org/v2/";
let VERSION = "eng-ESV";
//let firebase = require("firebase/app");


//-------------------
//--Set up Server----
//-------------------
app.get("/", function(req, res){
	console.log("Serving index.html...");
	res.sendFile(__dirname + "/public/index.html");
})

http.listen(PORT_NUMBER, function(){
	console.log("Listening on port " + PORT_NUMBER);
})

//-------------------
//-----Set Up DB-----
//-------------------

//<script src="https://www.gstatic.com/firebasejs/3.6.7/firebase.js"></script>
//<script src="https://www.gstatic.com/firebasejs/3.6.2/firebase-database.js"></script>
var config = {
    apiKey: "AIzaSyDw-79Bzf9TpI3wwl32yHhYKEGrYs-UNR4",
    authDomain: "howtousefirebase-da626.firebaseapp.com",
    databaseURL: "https://howtousefirebase-da626.firebaseio.com",
    storageBucket: "howtousefirebase-da626.appspot.com",
    messagingSenderId: "919229157737"
  };
//firebase.initializeApp(config);

//let database = firebase.database();

function populateDatabase(){
	//if db is empty, populate
		//make a request to gather all tags with types
		request({
			url: baseUrl + "tags.js"
		}, function(error, response, body){
		//GET tags.js
		});
}

//-------------------
//--Listen for POST--
//-------------------

app.use(bodyParser.json())
   .use(bodyParser.urlencoded({extended: true}));

app.post("/server/post_tag", function(req, res){
	res.send(getVersesByTag(req.body.tag));
})

//-------------------
//-----API calls-----
//-------------------

var versesObjects = [];

function search(query){
	request({
		url: baseUrl + "search.js?query=" + query + "&version=" + VERSION,
	},function(error, response, body){
		if(error || response.statusCode != 200){
			console.log("Error in accessing API");
		}else{
			body = JSON.parse(body);
			var matchingVerses = body.response.search.result.verses;
			matchingVerses.forEach(function(verse){
				versesObjects.push({
					reference: verse.reference,
					text_html: verse.text,
				});
			});
			//console.log(versesObjects);
		}
	});
}

function getVersesByTag(tagName){
	request({
		url: baseUrl + "tags/" + tagName + ".js"
	}, function(error, response, body){
		if(error || response.statusCode != 200){
			console.log("Error in accessing API");
		}else{
			body = JSON.parse(body);
			var matchingReferences = body.response.tags[0].references;
			var referenceObjects = [];
			matchingReferences.forEach(function(reference){
				referenceObjects.push(
					{
						start: reference.reference.start.split(":")[1],
						end: reference.reference.end.split(":")[1],
					}
				);
			});
			convertReferencestoPassages(referenceObjects);
		}
	});
}

function convertReferencestoPassages(references){
	references.forEach(function(reference){
		request({
			url: baseUrl + "passages.js?q[]=" + reference.start
			+ ((reference.start == reference.end) ? "" : ("-" + reference.end))
			+ "&version=" + VERSION,
		}, function(error, response, body){
			if(error || response.statusCode != 200){
				console.log("Error in accessing API");
			}else{
				body = JSON.parse(body);
				versesObjects.push({
					reference,
					text_html: body.response.search.result.passages[0].text,
				});
			}
		});
	});
}

//getVersesByTag("peace");

// setTimeout(function() {
// 	console.log(versesObjects);
// }, 10000);