var tail = require('./lib/tail').tail,
    analyse = require('./lib/analyse').analyse,
    mp = require('./lib/measurement-protocol'),
    configuration = require('./lib/configuration');

module.exports = {
  'tail': tail,
  'analyse': analyse,
  'mp': mp,
  'configuration': configuration
}
