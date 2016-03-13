var level = require('level');

// Create database
var db = level('./test.db');

// Put data into database
db.get('world', function(err, data) {
  if (err) console.log;
  else console.log(`got data: ${data}`);
});
