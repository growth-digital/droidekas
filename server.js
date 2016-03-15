#! /usr/bin/env node

var http = require('http');
var net = require('net');
var fs = require('fs');
var childProcess = require('child_process');
var websocket = require('websocket');
var dir = __dirname + '/public';
var files = fs.readdirSync(dir);
var commander = require('commander');

commander
  .option('--hostname <hostname>', 'server hostname')
  .option('--port <port>', 'server port')
  .option('--verbose', 'display all information')
  .parse(process.argv);

if (!commander.hostname || !commander.port) {
  commander.hostname = 'localhost';
  commander.port = '8080';
}

try {
  // Filter Google Analytics only logs
  childProcess.execSync('adb shell setprop log.tag.GAv4 DEBUG');
  // Clear logs
  childProcess.execSync('adb logcat -c');
} catch (exc) {
  // Device is not attached to the computer
  return;
}

var logcat = childProcess.spawn('adb', ['logcat', '-s', 'GAv4']);

// http
var httpServer = http.createServer(function(request, response) {
  var file = request.url === '/' ? 'index.html' : request.url.slice(1);
  if (!~files.indexOf(file)) {
    response.writeHead(404);
    response.end();
  } else {
    var content = fs.readFileSync(dir + '/' + file);
    if (!~file.indexOf('png')) {
      content = content.toString();
      if (file === 'index.html') {
        content = content.replace('{{HOSTNAME}}', commander.hostname);
        content = content.replace('{{PORT}}', commander.port);
      }
    }
    response.end(content);
  }
  console.log(formattedDate() + ' - ' + request.url + ' - ' + response.statusCode);
}).listen(commander.port, commander.hostname, function() {
  console.log(formattedDate() + ' Droidekas server is listening on port: ' + commander.port);
});

var websocketServer = new websocket.server({
  httpServer: httpServer
});

websocketServer.on('request', function(request) {
  var connection = request.accept('subscribe', request.origin);
  console.log(formattedDate() + ' Websocket connection accepted');

  logcat.stdout.on('data', function(data) {
    data = data.toString();
    console.log(data);
    var parameters = JSON.stringify(parse(data));
    if (!parameters) {
      return;
    }
    connection.sendUTF(parameters);
  });

});

function parse(message) {
  // Message can be any type of <String> the user inputs so regEx matching won't
  // be 100% accurate in all GA hit cases.
  var parameters = {};
  var regexParams = /(\w+=)[^¶¶]+/g;
  var splitRegex = /(\w+)=(.*)/;
  message = message.replace(/,\s(\w)/g, '¶¶$1');
  var groups = message.match(regexParams);

  if (!groups) {
    return;
  }

  groups.forEach(function(elem) {
    var groups = elem.match(splitRegex);
    parameters[groups[1]] = groups[2];
  });

  // Remove unecessary parameters in order to save precious viewport space
  if (!commander.verbose) {
    delete parameters._s;
    delete parameters._v;
    delete parameters.a;
    delete parameters.adid;
    delete parameters.ate;
    delete parameters.sf;
    delete parameters.ht;
  }

  return parameters;
}

function formattedDate() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
