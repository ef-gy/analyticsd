var conf = {},
    os = require('os'),
    argv = require('minimist')
        (process.argv.slice(2),
          {
            'boolean': ['backfill', 'daemon', 'echo-post', 'tor']
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
      'periodic': {},
      'template': {},
      'pattern': [],
      'filter': [],
      'derive': []
    };
  }
  if (!this.strip) {
    this.strip = {};
  }
  if (!this.threshold) {
    this.threshold = {};
  }
  if (!this.ip) {
    var interfaces = os.networkInterfaces();
    for (i in interfaces) {
      for (j in interfaces[i]) {
        var n = interfaces[i][j];
        if (n.family === 'IPv4') {
          if (!n.address.match(/^127\./)) {
            this.ip = n.address;
          }
        }
      }
    }
  }
  if (argv.tid) {
    this.tid = argv.tid;
  }
  if (argv.ip) {
    this.ip = argv.ip;
  }
  if (argv.tor) {
    this.tor = argv.tor;
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
  if (argv['echo-post']) {
    this['echo-post'] = argv['echo-post'];
  }
  if (argv.endpoint) {
    this.endpoint = argv.endpoint;
  }
  if (argv.pid) {
    this.pid = argv.pid;
  }
  if (argv.user) {
    this.user = argv.user;
  }
  if (argv.group) {
    this.group = argv.group;
  }
  if (argv.threshold) {
    for (index in argv.threshold) {
      this.threshold[index] = argv.threshold[index];
    }
  }
  if (argv.strip) {
    for (index in argv.strip) {
      this.strip[index] = argv.strip[index];
    }
  }
  if (argv.payload && argv.payload.map) {
    for (index in argv.payload.map) {
      this.payload.map[index] = argv.payload.map[index];
    }
  }
  if (argv.analyse && argv.analyse.pattern) {
    for (index in argv.analyse.pattern) {
      this.analyse.pattern.push(argv.analyse.pattern[index]);
    }
  }
  if (argv.analyse && argv.analyse.filter) {
    for (index in argv.analyse.filter) {
      this.analyse.filter.push(argv.analyse.filter[index]);
    }
  }
  if (argv.analyse && argv.analyse.derive) {
    for (index in argv.analyse.derive) {
      this.analyse.derive.push(argv.analyse.derive[index]);
    }
  }
  if (argv.analyse && argv.analyse.template) {
    for (index in argv.analyse.template) {
      this.analyse.template[index] = argv.analyse.template[index];
    }
  }
  if (argv.analyse && argv.analyse.periodic) {
    for (index in argv.analyse.periodic) {
      this.analyse.periodic[index] = argv.analyse.periodic[index];
    }
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
    require('fs').writeFile(conf.pid, process.pid, console.error); 
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
