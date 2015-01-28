var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(function(req, res, next) {
  if (req.headers['x-forwarded-proto'] == 'http') { 
    res.redirect('https://' + req.headers.host + req.path);
  } else {
    return next();
  }
});

app.disable('x-powered-by');

app.use('/', express.static(__dirname + '/public', { maxAge: 86400000 }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

require('./app/routes.js')(app, express);

var serverIP = process.env.ENV_VAR_IP || '127.0.0.1';
var serverPort = process.env.ENV_VAR_PORT || 3000;

app.listen(serverPort, serverIP, function() {
  console.log('The AnimeUltima API are listening on port ' + serverPort + '.');
});