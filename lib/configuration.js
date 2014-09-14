var conf = {},
    argv = require('minimist')
        (process.argv.slice(2),
          {
            'boolean': ['backfill']
          });

conf.process = function(argv) {
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
}

conf.process(require('../conf/default'));
conf.process(argv);

console.log(conf);

module.exports = conf;
