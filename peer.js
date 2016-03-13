var debug = require('debug')('p2p');
var net = require('net');
var topology = require('fully-connected-topology');
var streamSet = require('stream-set');
var jsonStream = require('duplex-json-stream');

var nickname = process.argv[2] // first argument is gonna be your own address
var me = process.argv[3] // first argument is gonna be your own address
var peers = process.argv.slice(4) // the rest should be the peers you want to connect to

var swarm = topology(me, peers);
var activePeers = streamSet();

// Basically, we use the topo to create the connection swarm
// use those events to add to the list of active peers
// and the peers are json duplex streams....

var peerIds = {};
var sessionId = Math.random();
var seq = 0;

swarm.on('connection', function(socket, id) {
  debug(`connected to ${id}`);
  // Now that we have acceess to a peer, add the event listener to print that peer's message to StdOut
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
  var peer = jsonStream(socket);
  // Add the peer to the duplex stream group
  activePeers.add(peer);
});

process.stdin.on('data', (data)=>{
  seq++;
  // Update own last message
  peerIds[sessionId] = seq;
  debug('updating sequence', seq);
  share({nick: nickname, msg: data.toString(), id: sessionId, seq: seq});
});

function print (data) {
  process.stdout.write(`${data.id} #${data.seq} ${data.nick} > ${data.msg}`);
}
function share (data) {
  activePeers.forEach((p)=>{
    p.write(data);
  });
}
