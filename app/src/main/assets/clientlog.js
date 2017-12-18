var clientLogs = [];
var MAX_LOGS_THRESHOLD_SECONDS = 180;
var loggerTimer = setInterval(sendLogs, MAX_LOGS_THRESHOLD_SECONDS * 1000);
var DEFAULT_LOG_LEVEL = 'info';
var loggerAPIURL = '/xhr/logger';

function log(data, level) {
  	var currentObj = {
		url		  :   window.location.href,
		context   :   navigator.userAgent,
		level     :   level || DEFAULT_LOG_LEVEL,
		data      :   data
    };
    clientLogs.push(currentObj);
}

function sendLogs(){
	if(!clientLogs.length){
		return false;
	}
	sendXHR(clientLogs);
    clientLogs = [];
}

function sendXHR(data){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', loggerAPIURL);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
	    if (xhr.status === 200) {
	        console.log(xhr.responseText);
	    }
	};
	xhr.send(JSON.stringify(data));
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    var message = "";
    if (string.indexOf(substring) > -1){
        message = 'Script Error: See Browser Console for Detail';
    } else {
        message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');
    }
    var logObject = {
    	url		  :   window.location.href,
    	context   :   navigator.userAgent,
    	level     :   'error',
    	data      :   message
    }
    sendXHR([logObject]);
};

window.onbeforeunload = function(e) {
	clearTimeout(loggerTimer);
	sendLogs();
};