var net = require('net');
var topology = require('fully-connected-topology');

var me = process.argv[2] // first argument is gonna be your own address
var peers = process.argv.slice(3) // the rest should be the peers you want to connect to

var t1 = topology(me, peers);

t1.on('connection', function(connection, peer) {
    console.log(`${me} is connected to ${peer}`);
});
