var fs = require('graceful-fs');
var logger = require('tracer').console({
  transport: function (data) {
    var stream = fs.createWriteStream('./logs/error.log', {
      'flags': 'a',
      'mode': 0644
    });
    
    stream.write(data.output + '\n');
    stream.end();
  }
});

exports.error = function (data) {
  logger.error(data);
};