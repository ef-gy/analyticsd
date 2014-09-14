var conf = {},
    argv = require('minimist')
        (process.argv.slice(2),
          {
            'boolean': ['backfill']
          });

conf.process = function(argv) {
  if (!this.payload) {
    this.payload = {
      'map': {}
    };
  }
  if (argv.tid) {
    this.tid = argv.tid;
  }
  if (argv.tail) {
    this.tail = Array.isArray(argv.tail) ? argv.tail : [ argv.tail ];
  }
  if (argv._) {
    for (i in argv._) {
      this.tail.push(argv._[i]);
    }
  }
  if (argv.backfill) {
    this.backfill = argv.backfill;
  }
  if (argv.endpoint) {
    this.endpoint = argv.endpoint;
  }
  if (argv.payload && argv.payload.map) {
    for (index in argv.payload.map) {
      this.payload.map[index] = argv.payload.map[index];
    };
  }
}

conf.process(require('../conf/default'));
conf.process(argv);

console.log(conf);

module.exports = conf;
