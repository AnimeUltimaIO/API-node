var mysql = require('mysql');

var pool = mysql.createPool({
  host: process.env.ANIMEULTIMA_MYSQL_DB_HOST,
  user: process.env.ANIMEULTIMA_MYSQL_DB_USERNAME,
  password: process.env.ANIMEULTIMA_MYSQL_DB_PASSWORD,
  database: 'animeultima',
  connectionLimit: 5000
});

exports.getConnection = function (callback) {
  pool.getConnection(function (err, connection) {
    callback(err, connection);
  });
};