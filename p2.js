
var debug = require('debug')('pers');
var topology = require('fully-connected-topology');
var lookup = require('lookup-multicast-dns');
var register = require('register-multicast-dns');
var hashPort = require('hash-to-port');
var level = require('level');
var scuttleup = require('scuttleup');

var me = process.argv[2] // first argument is gonna be your own address
var friends = process.argv.slice(3) // the rest should be the peers you want to connect to

// Put me on dns by port name
debug(`About to register at ${me}`);
register(me);

var swarm = topology(`localhost:${hashPort(me)}`);
var logsConfig = {live: true, valueEncoding: 'utf-8'};
var logs = scuttleup(level(me + '.db')); // use a database per user

// Find other hosts
friends.forEach(function friendFinder(f) {
  lookup(`${f}.local`, function(err, socket) {
    if (err) {
      debug('Error looking up dns', err);
      //process.exit(1);
    }
    else {
      debug(`Resolved ${f} -> ${socket}`)
      var peerHost = `${socket}:${hashPort(f)}`;
      swarm.add(peerHost);
    }
  });
});

swarm.on('connection', function(socket, id) {
    debug(`Connected -> ${id}`);
    socket.pipe(logs.createReplicationStream(logsConfig)).pipe(socket);
});

process.stdin.on('data', function datInputHandler(data) {
    //debug('CLI data', data.toString());
    logs.append(`${me} > ${data}`);
});

var history = {};
// print out what we are storing in the logs
var rs = logs.createReadStream(logsConfig);
rs.on('data', function logReadHandler(data) {
    if (history.peer > data.seq) {
        debug('Old Data', data);
        debug(`becase the latest news is ${history.peer}`);
    }
    else {
        debug('New data', data);
        history.peer = data.seq; 
        process.stdout.write(data.entry);
    }
});
