var conf = {},
    argv = require('minimist')(process.argv.slice(2));

conf.process = function(argv) {
  if (argv.tid) {
    this.tid = argv.tid;
  }
  if (argv.files) {
    this.files = argv.files;
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
