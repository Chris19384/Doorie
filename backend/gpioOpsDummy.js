var canAccessGpio = true;

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

module.exports.canAccessGpio = canAccessGpio;
module.exports.triggerLeftDoor = function(cb) {
    wait2Seconds((err, res) => {
        cb(null, "OK");
    });
};
module.exports.triggerRightDoor = function(cb) {
    wait2Seconds((err, res) => {
        cb(null, "OK");
    });
};
