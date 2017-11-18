const async = require('async');
var exec = require('child_process').exec;





// NOTE:
// this file should only be used with 
//   Asus Tinker Board
// and a recent Debian OS


// constants
const OUTPUT  = 'out';
const HIGH    =     1;
const LOW     =     0;

// wiringPi pins:
var pin_power = 22;     // sys pin 31 (GPIO06)   ->   POWER 3.3V
var pin_left  =  4;     // sys pin 16 (GPIO23)   ->   left Door
var pin_right =  5;     // sys pin 18 (GPIO24)   ->   right Door


console.log("Info: Using gpioOpsTinker!");
gpioInit();


//  gpio state,
// true when interacting is allowed
// false when gpio is already in use
var canAccessGpio = true;


function pinMode(pin, val) {
	exec("gpio mode " + pin + " " + val);
}

function digitalWrite(pin, val) {
	exec("gpio write " + pin + " " + val);
}


// call this before invoking openDoor() or closeDoor()
function gpioInit() {
	pinMode(pin_power, OUTPUT);
	pinMode(pin_left, OUTPUT);
	pinMode(pin_right, OUTPUT);

	wait200Milliseconds(() => {
		powerCircuitOFF(() => {});
	});
}

function wait2Seconds(cb) {
	setTimeout(() => {
		cb(null, "OK");
		return;
	}, 2000);
}

function wait200Milliseconds(cb) {
	setTimeout(() => {
		cb(null, "OK");
		return;
	}, 200);
}

function powerCircuitON(cb) {
	digitalWrite(pin_power, HIGH);
	cb(null, "OK");
}

function powerCircuitOFF(cb) {
	digitalWrite(pin_power, LOW);
	cb(null, "OK");
}


function setLeftDoorHigh(cb) {
	digitalWrite(pin_left, HIGH);
	cb(null, "OK");
}

function setLeftDoorLow(cb) {
	digitalWrite(pin_left, LOW);
	cb(null, "OK");
}



function setRightDoorHigh(cb) {
	digitalWrite(pin_right, HIGH);
	cb(null, "OK");
}

function setRightDoorLow(cb) {
	digitalWrite(pin_right, LOW);
	cb(null, "OK");
}

// sets HIGH for two seconds
function triggerLeftDoor(cb) {
	canAccessGpio = false;
	console.log("DOOR LEFT -> OPENING");
	async.series([
		powerCircuitON,
		wait200Milliseconds,
		setLeftDoorHigh,
		wait2Seconds,
		setLeftDoorLow,
		powerCircuitOFF
	], () => {
		console.log("FINISHED TRIGGER <LEFT> DOOR!");
		canAccessGpio = true;
		cb(null, "OK");
		return;
	});
}


// sets HIGH for two seconds
function triggerRightDoor(cb) {
	canAccessGpio = false;
	console.log("DOOR RIGHT -> OPENING");
	async.series([
		powerCircuitON,
		wait200Milliseconds,
		setRightDoorHigh,
		wait2Seconds,
		setRightDoorLow,
		powerCircuitOFF
	], () => {
		console.log("FINISHED TRIGGER <RIGHT> DOOR!");
		canAccessGpio = true;
		cb(null, "OK");
		return;
	});
}


module.exports.canAccessGpio = canAccessGpio;
module.exports.triggerLeftDoor = triggerLeftDoor;
module.exports.triggerRightDoor = triggerRightDoor;
