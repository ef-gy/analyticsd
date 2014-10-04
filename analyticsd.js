var tail = require('./lib/tail').tail,
    analyse = require('./lib/analyse'),
    mp = require('./lib/measurement-protocol'),
    configuration = require('./lib/configuration'),
    tor = require('./lib/tor'),
    daemon = require('./lib/daemon').daemon;

module.exports = {
  'tail': tail,
  'analyse': analyse,
  'mp': mp,
  'configuration': configuration,
  'tor': tor,
  'daemon': daemon
}
