var request = require('request');
var fs = require('graceful-fs');
var findRemoveSync = require('find-remove');
var db = require('../../config/db.js');
var utility = require('../utility.js');

exports.view = function (input, callback) {
  getFile(input, function (data) {
    if (data) {
      callback(null, data);
    } else {
      getDataFromDb(input, function (err, results) {
        if (err) {
          callback(err);
        } else {
          getLink(input, results, function (err, json) {
            if (err) {
              callback(err);
            } else {
              callback(null, json);
            }
          });
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
          
          callback(null, results);
        }
      });
    }
  });
}

function writeVideo(input, data, callback) {
  fs.writeFile('./json/' + getFileName(input) + '.json', data, { mode: 420 }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function getFileName(input) {
  return 'video_' + input.id + '_' + input.epnum;
}

function getQuery(conn, input) {
  var sql = 'SELECT servicevideoid '
    + 'FROM videomirrors '
    + 'WHERE anime_id = ' + conn.escape(input.id)
    + ' AND episode_num = ' + conn.escape(input.epnum)
    + ' AND service = "auengine" '
    + 'AND status != "deleted"';
  
  return sql;
}

function getLink(input, data, callback) {
  if (data.length === 0) {
    
    callback(null, JSON.stringify({
      'message': 'Sorry, there were no results';
    }));
    
  } else {
    request('http://www.auengine.com/api.php?file=' + data[0].servicevideoid
    , function (err, response, body) {
      if (err) {
        callback(err);
      } else {
        var json = JSON.stringify({
          'video': body;
        });
        
        writeVideo(input, json, function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null, json);
          }
        });
      }
    });
  }
}