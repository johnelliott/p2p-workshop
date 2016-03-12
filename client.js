var net = require('net');

var client = net.connect(8124, ()=>{
  console.log('client connection!');
});

client.write('hello this is client');
client.on('data', (data)=>{
  console.log('data', data.toString());
  client.end();
});
