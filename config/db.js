var mysql = require('mysql');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'animeultima',
  connectionLimit: 5000
});

exports.getConnection = function (callback) {
  pool.getConnection(function (err, connection) {
    callback(err, connection);
  });
};