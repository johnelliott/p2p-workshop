var net = require('net');

var socket = net.connect(8124, 'localhost', ()=>{
  console.log('connection!', Date.now());
});

process.stdin.on('data', (data)=>{
  socket.write(data);
});

socket.on('data', (data)=>{
  process.stdout.write(data);
});
