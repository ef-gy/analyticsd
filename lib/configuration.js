var conf = {},
    argv = require('minimist')(process.argv.slice(2));

conf.process = function(argv) {
  if (argv.tid) {
    this.tid = argv.tid;
  }
  if (argv.tail) {
    this.tail = Array.isArray(argv.tail) ? argv.tail : [ argv.tail ];
  }
  if (argv._) {
    for (i in argv._) {
      this.files.push(argv._[i]);
    }
  }
}

conf.process(require('../conf/default'));
conf.process(argv);

console.log(conf);

module.exports = conf;
