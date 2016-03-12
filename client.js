var net = require('net');
var lookup = require('lookup-multicast-dns');
var jsonStream = require('duplex-json-stream');

var nickname = process.argv[2];
console.log('nickname:', nickname);

lookup('tron.local', function (err, ip) {
  if (err) {
    console.log('error looking up dns', err);
    process.exit(1);
  }
  var socket = net.connect(8124, ip);
  socket = jsonStream(socket)

  process.stdin.on('data', (data)=>{
    socket.write({nick: nickname, msg: data.toString()});
  });

  socket.on('data', (data)=>{
    process.stdout.write(data);
  });
});
