var level = require('level');
var scuttleup = require('scuttleup');

var db = level('./logs.db');
var log = scuttleup(db, {valueEncoding: 'utf-8'});
log.append('hello world');
//var ls = log.createAppendStream();
//process.stdin.pipe(ls);
