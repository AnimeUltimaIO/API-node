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
  findRemoveSync('./json', { age: { seconds: 900 }, extensions: '.json' });
    
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
          
          if (results.length === 0 || (input.take && results[input.take] === 0)) {
            
            callback(null, JSON.stringify({
              'message': 'Sorry, there were no results'
            }, null, 2));
            
          } else {
          
            var stringified =  JSON.stringify(results, null, 2);
          
            writeEpisode(input, stringified, function (err) {
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

function writeEpisode(input, data, callback) {
  fs.writeFile('./json/' + getFileName(input) + '.json', data, { mode: 420 }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function getFileName(input) {
  return !input.take
    ? 'listEpisode' + utility.capitalize(input.id)
    : 'newEpisodes' + utility.capitalize(input.take);
}

function getQuery(conn, input) {
  var sql;
  
  if (!input.take) {
    
    sql = 'SELECT id, episode_num, status, timestamp, views, airdate '
      + 'FROM episodes '
      + 'WHERE anime_id = ' + conn.escape(input.id)
      + ' ORDER BY CAST(episode_num AS UNSIGNED) ASC';

  } else {
    
    sql = 'SELECT channelid AS anime_id, episode_num, thumbnail, lang, timestamp '
      + 'FROM episodes '
      + 'ORDER BY timestamp DESC';
      
  }
  
  return sql;
}