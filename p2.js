
var debug = require('debug')('pers');
var topology = require('fully-connected-topology');
var streamSet = require('stream-set');
var jsonStream = require('duplex-json-stream');
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
var activePeers = streamSet();
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
   // Add a peer json duplex stream to the stream set
  activePeers.add(jsonStream(socket));
  //socket.pipe(logs.createReplicationStream(logsConfig)).pipe(socket)
});

process.stdin.on('data', function datInputHandler(data) {
    debug('CLI data', data.toString());
    logs.append(data);
});

// print out what we are storing in the logs
var rs = logs.createReadStream(logsConfig);
rs.on('data', debug);
