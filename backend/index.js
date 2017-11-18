const express = require('express');
const bodyParser = require("body-parser");

const secret = require('./secret.js');
var logger = require('./logger.js');



///
// switch for testing
///

// var gpioOps = require('./gpioOpsPi.js');
 var gpioOps = require('./gpioOpsTinker.js');
// var gpioOps = require('./gpioOpsDummy.js');





// webserver setup
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/doorie/", (req, res) => {
	console.log("incoming request");
	res.sendStatus(200);
	res.end("Hello");
})

app.post("/doorie/action", (req, res) => {
	// the password to authenticate the user
	var key = req.body.key;

	// which door to use
	// "l" for left door
	// "r" for right one
	var door = req.body.door;

	// either "open" or "close"
	var todo = req.body.todo;

	if(!isUserAuthenticated(key)) {
		res.sendStatus(403);
		res.end("no");
		return;
	}

	if(door == undefined || todo == undefined) {
		console.log("/action missing data!");
		res.sendStatus(400);
		res.end("no");
		return;
	}

	if((door == "l" || door == "r") && (todo == "open" || todo == "close")) {
		if(gpioOps.canAccessGpio) {
			openDoor(door);
			console.log("/action (authenticated) successful:");
			console.log(`${todo} | ${door}`);
			res.sendStatus(200);
			res.end("ok");
		} else {
			console.log("/action GPIO wanted, but already in use!");
			res.sendStatus(600);
			res.end("no");
		}
		return;
	} else {
		console.log("/action bad parameters!");
		res.sendStatus(400);
		res.end("ok");
		return;
	}
});

app.post("/doorie/log", (req, res) => {
	// the password to authenticate the user
	var key = req.body.key;

	if(!isUserAuthenticated(key)) {
		res.sendStatus(403);
		return;
	}

	res.end(logger.getReadable());
});



webserverListen();



// -> bool
// log ip: logq.get("x-real-ip")
function isUserAuthenticated(key) {
	if(key != secret.passphrase) {
		console.log("User not authenticated key: '" + key + "'");
		logger.log("User not authenticated");
		return false;
	} else {
		return true;
	}
}

function webserverListen() {
	app.listen(secret.port, function() {
		console.log(`webserver listening on port ${secret.port}!`);
	})
}


// whichDoor should be "l" or "r"
function openDoor(whichDoor) {
	if(whichDoor == "l") {
		console.log("\n< - - - - - - - - - - - - - - - - ->");
		gpioOps.triggerLeftDoor(() => {
			console.log("Callback triggerLeftDoor() finished");
			console.log("< - - - - - - - - - - - - - - - - ->\n");
			logger.log("Door l modified!");
		});
	} else if(whichDoor == "r") {
		console.log("\n< - - - - - - - - - - - - - - - - ->");
		gpioOps.triggerRightDoor(() => {
			console.log("Callback triggerRightDoor() finished");
			console.log("< - - - - - - - - - - - - - - - - ->\n");
			logger.log("Door r modified!");
		});
	} else {
		console.error("FATAL ERROR: openDoor(whichDoor) -> whichDoor is NOT l or r!");
	}
}
