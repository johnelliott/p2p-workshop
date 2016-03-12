var net = require('net');

var server = net.createServer((socket)=>{
  socket.on('data', (data)=>{
    socket.write(data);
  });
  socket.on('end', ()=>{
    server.close(()=>{
      console.log('server closed');
    });
  });
});

server.listen(8124, ()=>{
  console.log('server listening on 8124');
});
