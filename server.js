var net = require('net');
var streamSet = require('stream-set');

var activeSockets = streamSet();

var server = net.createServer((socket)=>{

  activeSockets.add(socket);

  // will print "set size is 1"
  console.log('set size is', activeSockets.size)
  socket.on('close', function () {
    // will print "set size is 0"
    console.log('set size is', activeSockets.size)
  })

  socket.on('data', (data)=>{
    activeSockets.forEach((s)=>{
      s.write(data);
    });
  });
});

server.listen(8124, ()=>{
  console.log('server listening on 8124');
});
