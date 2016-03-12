var net = require('net');
var streamSet = require('stream-set');
var jsonStream = require('duplex-json-stream');

var activeSockets = streamSet();

var server = net.createServer((socket)=>{

  // turn the transport stream into an object stream
  socket = jsonStream(socket)
  activeSockets.add(socket);

  // will print "clients: 1"
  console.log('clients:', activeSockets.size)

  socket.on('data', (data)=>{
    activeSockets.forEach((s)=>{
      s.write(`${data.nick} > ${data.msg}`);
    });
  });
  socket.on('close', function () {
    // will print "clients: 0"
    console.log('clients:', activeSockets.size)
  })
});

server.listen(8124, ()=>{
  console.log('server listening on 8124');
});
