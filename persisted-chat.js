var debug = require('debug')('pers');
var net = require('net');
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

// Create logs for the current user
var logs = scuttleup(level(me + '.db')); // use a database per user

// Find other hosts
friends.forEach(function friendFinder(f) {
  lookup(`${f}.local`, function(err, ip) {
    if (err) {
      console.log('Error looking up dns', err);
      process.exit(1);
    }
    debug(`Resolved ${f} -> ${ip}`)
    var peerHost = `${ip}:${hashPort(f)}`;
    swarm.add(peerHost);
  });
});

// Basically, we use the topo to create the connection swarm
// use those events to add to the list of active peers
// and the peers are json duplex streams....

var peerIds = {};
var sessionId = Math.random();
var seq = 0;

swarm.on('connection', function(socket, id) {
  debug(`Connected to ${id}`);
  // Now that we have acceess to a peer, add the event listener to print that peer's message to StdOut
  // handle data events, gossipy
  socket.on('data', (buffer)=>{
    var data = JSON.parse(buffer);
    debug('Incoming data', data);
    // determine last message from this peer
    var lastKnownMessage = peerIds[data.id];
    debug('Last known message', lastKnownMessage);
    //debug('Incoming data format', typeof data);
    //check if this is new
    var thisIsNew = (lastKnownMessage==undefined || data.seq > lastKnownMessage);
    debug('Is this new?', thisIsNew);
    // take note of this message
    // ignore message that have already been received
    // check that this message is newer than the last from this person
    if (thisIsNew) {
      // share message
      share(data);
      // print message
      print(data);
      // note that this is a new message
      peerIds[data.id] = data.seq;
    }
  });
   // Add a peer json duplex stream to the stream set
  activePeers.add(jsonStream(socket));
});

process.stdin.on('data', (data)=>{
  seq++;
  // Update own last message
  peerIds[sessionId] = seq;
  //debug('Updating sequence', seq);
  share({nick: me, msg: data.toString(), id: sessionId, seq: seq});
});

function print (data) {
  process.stdout.write(`${data.id} #${data.seq} ${data.nick} > ${data.msg}`);
}
function share (data) {
  activePeers.forEach((p)=>{
    p.write(data);
  });
}
