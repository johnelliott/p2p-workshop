var level = require('level');

// Create database
var db = level('./test.db');

// Put data into database
db.put('world', 'hello', function(err) {
  if (err) console.log;
  else console.log('did it');
});
