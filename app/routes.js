var toobusy = require('toobusy-js');
var anime = require('./controllers/anime.js');
var episode = require('./controllers/episodeController.js');
var video = require('./controllers/videoController.js');
var log = require('./logger.js');

module.exports = function (app, express) {
  var router = express.Router();
  
  router.use(function (req, res, next) {
    setHeaders(res);
    
    if (toobusy()) {
      res.status(503)
        .write(JSON.stringify({
          'error': 503,
          'message': 'Sorry, the API is too busy right now.'
        }, null, 2));
    
      res.end();
    } else {
      return next();
    }
  });
  
  router.get('/', function (req, res) {
    res.write(JSON.stringify({
      message: 'Welcome to the AnimeUltima API!'
    }, null, 2));
    
    res.end();
  });
  
  router.get('/anime/list', function (req, res) {
    anime.list(null, function (err, data) {
      anime.handler(res, log, err, data);
    });
  });
    
  router.get('/anime/list/:status(ongoing|completed)', function (req, res) {
    anime.list(req.params.status, function (err, data) {
      anime.handler(res, log, err, data);
    });
  });
  
  router.get('/anime/view/:id([0-9]+)', function (req, res) {
    anime.list(req.params.id, function (err, data) {
      anime.handler(res, log, err, data);
    });
  });
  
  router.get('/episodes/newepisodes/:take([0-9]+)', function (req, res) {
    episode.list(req.params, function (err, data) {
      episode.handler(res, log, err, data);
    });
  });
  
  router.get('/episodes/list/:id([0-9]+)', function (req, res) {
    episode.list(req.params, function (err, data) {
      episode.handler(res, log, err, data);
    });
  });
  
  router.get('/video/:id([0-9]+)/:epnum([0-9\.-]+)', function (req, res) {
    video.view(req.params, function (err, data) {
      video.handler(res, log, err, data);
    });
  });
  
  router.use(function(req, res, next) {
    res.status(404)
      .write(JSON.stringify({
        'error': 404,
        'message': 'Sorry, the requested path could not be found.'
      }, null, 2));
      
    res.end();
  });
  
  app.use('/au-api', router);
  
};

function setHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://animeultima.io/api/');
  res.setHeader('Content-Security-Policy', "script-src 'self' https://code.jquery.com https://animeultima.io/api/; object-src 'self'");
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'master-only');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Ua-Compatible', 'IE=Edge,chrome=1');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma','no-cache');
  res.setHeader('Expires', '0');
}