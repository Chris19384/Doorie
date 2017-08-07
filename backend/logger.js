
var logData = [];

module.exports.init = function() {
	logData = [];
}

// adds a log statement at the end of the array
module.exports.log = function(str) {
	if(logData.length < 50) {
        // del one at the end
        logData.splice(logData.length-1);
	}

    // add
    logData.push({time: Date.now(), action: str});
}

// returns a human-readable string
module.exports.getReadable = function() {
	var str = "";
	for (var i = logData.length - 1; i >= 0; i--) {
		str += "[" + new Date(logData[i].time).toLocaleString() + "] " + logData[i].action + "\n";
	};
	return str;
}

// returns the log array (object)
module.exports.getLog = function() {
	return logData;
}
