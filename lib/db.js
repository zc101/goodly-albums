// Database connector

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 100,
  socketPath      : '/var/run/mysqld/mysqld.sock',
  user            : 'goodlyalbums-app',
  password        : 'goodlyalbums-app',
  database        : 'GOODLYALBUMS'
});

pool.getConnection(function(err, connection) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected successfully to GOODLYALBUMS db via MySQL socket.');
  connection.release();
});

module.exports = pool;
