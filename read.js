var level = require('level');
var scuttleup = require('scuttleup');

var db = level('./logs.db');
var log = scuttleup(db, {valueEncoding: 'utf-8'});

var changes = log.createReadStream({
  live: true
})

changes.on('data', function(data) {
  console.log(data.entry.toString()) // print out the log - data.entry will be 'hello world'
  console.log(data) // print out the log - data.entry will be 'hello world'
})
