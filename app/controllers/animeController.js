var fs = require('graceful-fs');
var findRemoveSync = require('find-remove');
var db = require('../../config/db.js');
var utility = require('../utility.js');

exports.list = function (input, callback) {
  getFile(input, function (data) {
    if (data) {
      callback(null, data);
    } else {
      getDataFromDb(input, function (err, results) {
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    }
  });
};

exports.handler = function (res, log, err, data) {
  if (err) {
    log.error(err);
    
    res.status(502)
      .write(JSON.stringify({
        'error': 502,
        'message': 'Sorry, an error occurred. Please inform the AU Staff of this occurrence.'
      }, null, 2));
      
    res.end();
  } else {
    res.write(data);
    
    res.end();
  }
};

function getFile(input, callback) {
  findRemoveSync('./json', { age: { seconds: 10800 }, extensions: '.json' });
    
  fs.readFile('./json/' + getFileName(input) + '.json', function (err, data) {
    return err
      ? callback(null)
      : callback(data);
  });
}

function getDataFromDb(input, callback) {
  var sql;
  
  db.getConnection(function (err, conn) { 
    if (err) {
      callback(err);
    } else {
      conn.query(getQuery(conn, input), function (err, results) {
        if (err) {
          callback(err);
        } else {
          conn.release();
          
          if (results.length === 0) {
            
            callback(null, JSON.stringify({
              'message': 'Sorry, there were no results'
            }, null, 2));
            
          } else {
          
            var stringified =  JSON.stringify(results, null, 2);
          
            writeAnime(input, stringified, function (err) {
              if (err) {
                callback(err);
              } else {
                callback(null, stringified);
              }
            });
          }
        }
      });
    }
  });
}

function writeAnime(input, data, callback) {
  fs.writeFile('./json/' + getFileName(input) + '.json', data, { mode: 420 }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function getFileName(input) {
  return !input
    ? 'animeListAll'
    : utility.isNumber(input)
    ? 'viewAnime' + input
    : 'animeList' + utility.capitalize(input);
}

function getQuery(conn, input) {
  var sql;
  
  if (!input) {
    
    sql = 'SELECT id, title, description, status, genre, slug, timestamp '
      + 'FROM anime '
      + 'ORDER BY title ASC';
      
  } else if (utility.isNumber(input)) {
    
    sql = 'SELECT id, title, description, status, genre, slug, timestamp '
      + 'FROM anime '
      + 'WHERE id = ' + conn.escape(input);
    
  } else {
    
    sql = 'SELECT id, title, description, status, genre, slug, timestamp '
      + 'FROM anime '
      + 'WHERE status = ' + conn.escape(input)
      + ' ORDER BY title ASC';
      
  }
  
  return sql;
}