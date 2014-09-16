var conf = {},
    argv = require('minimist')
        (process.argv.slice(2),
          {
            'boolean': ['backfill', 'daemon']
          });

conf.include = function(inc) {
  if (Array.isArray(inc)) {
    inc.forEach(this.include, this);
  } else if (typeof inc === 'string') {
    try {
      this.process(require(inc));
    } catch (e) {
      console.log (e);
    }
  }
}

conf.process = function(argv) {
  if (!this.payload) {
    this.payload = {
      'map': {}
    };
  }
  if (!this.analyse) {
    this.analyse = {
      'pattern': []
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
  if (argv.daemon) {
    this.daemon = argv.daemon;
  }
  if (argv.endpoint) {
    this.endpoint = argv.endpoint;
  }
  if (argv.user) {
    this.user = argv.user;
  }
  if (argv.group) {
    this.group = argv.group;
  }
  if (argv.payload && argv.payload.map) {
    for (index in argv.payload.map) {
      this.payload.map[index] = argv.payload.map[index];
    };
  }
  if (argv.analyse && argv.analyse.pattern) {
    for (index in argv.analyse.pattern) {
      this.analyse.pattern.push(argv.analyse.pattern[index]);
    };
  }
  if (argv.include) {
    this.include(argv.include);
  }
}

conf.process(require('../conf/default'));
conf.process(argv);

console.log(conf);

if (conf.daemon) {
  require('daemon')();

  try {
    fs.writeFile('/var/run/analyticsd.pid', ''+process.pid, console.error); 
  } catch (error) {
    console.error(error);
  }
}

try {
  process.setgid(conf.group);
  process.setuid(conf.user);
} catch (e) {
  console.log('ERROR: could not set user/group.');
  console.log(e);
}

module.exports = conf;
