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
    console.log(`socket:${socket} connected to ${id}`);
    // Now that we have acceess to the socket, set the process.stdOut
    socket.on('data', (data)=>{
      process.stdout.write(data);
    });
    // Add a peer json duplex stream to the stream set
    var peer = jsonStream(socket);
    // add the peer to the duplex stream group
    activePeers.add(peer);
});

process.stdin.on('data', (data)=>{
  activePeers.forEach((p)=>{
    p.write({nick: nickname, msg: data.toString()});
  });
});

// TODO write to local socket
