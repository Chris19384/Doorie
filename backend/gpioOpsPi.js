const gpio = require('rpi-gpio');
const async = require('async');


// NOTE:
// name pins by their raspberry pi pinout image!
// e.g. 7 for GPIO04!


// pins now set:
// pin 31 (GPIO06) -> POWER 3.3V
// pin 16 (GPIO23) -> left Door
// pin 18 (GPIO24) -> right Door

console.log("Info: Using gpioOpsPi!");
gpioInit();


//  gpio state,
// true when interacting is allowed
// false when gpio is already used
var canAccessGpio = true;


// call this before invoking openDoor() or closeDoor()
function gpioInit() {
	gpio.setup(31, gpio.DIR_OUT, () => {
		powerCircuitOFF(() => {});
	});
	gpio.setup(16, gpio.DIR_OUT);
	gpio.setup(18, gpio.DIR_OUT);
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
	gpio.write(31, true, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Circuit Power 3.3V -> ON");
        	cb(null, "OK");
        	return;
        }
    });
}

function powerCircuitOFF(cb) {
	gpio.write(31, false, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Circuit Power 3.3V -> OFF");
        	cb(null, "OK");
        	return;
        }
    });
}


function setLeftDoorHigh(cb) {
	gpio.write(16, true, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Left Door -> HIGH");
        	cb(null, "OK");
        	return;
        }
    });
}

function setLeftDoorLow(cb) {
	gpio.write(16, false, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Left Door -> LOW");
        	cb(null, "OK");
        	return;
        }
    });
}



function setRightDoorHigh(cb) {
	gpio.write(18, true, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Right Door -> HIGH");
        	cb(null, "OK");
        	return;
        }
    });
}

function setRightDoorLow(cb) {
	gpio.write(18, false, (err) => {
        if(err) console.error(err);
        else {
        	console.log("Right Door -> LOW");
        	cb(null, "OK");
        	return;
        }
    });
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
