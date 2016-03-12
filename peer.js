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

swarm.on('connection', function(socket, id) {
    console.log(`connected to ${id}`);
    // Now that we have acceess to a peer, add the event listener to print that peer's message to StdOut
    socket.on('data', (buffer)=>{
      //process.stdout.write(`${data.nick} > ${data.msg}`);
      var data = JSON.parse(buffer);
      process.stdout.write(`${data.nick} > ${data.msg}`);
    });
    // Add a peer json duplex stream to the stream set
    var peer = jsonStream(socket);
    // Add the peer to the duplex stream group
    activePeers.add(peer);
});

process.stdin.on('data', (data)=>{
  activePeers.forEach((p)=>{
    p.write({nick: nickname, msg: data.toString()});
  });
});
