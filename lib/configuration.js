var os = require('os');

function configuration (options, resume) {
  this.payload = {
    'map': {}
  };
  this.analyse = {
    'periodic': {},
    'template': {},
    'pattern': [],
    'filter': [],
    'derive': []
  };
  this.strip = {};
  this.threshold = {};
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

  if (options === undefined) {
    options = {};
  }
  if (options.sources === undefined) {
    options.sources = [];
  }
  if (options.defaults === undefined) {
    options.defaults = true;
  }
  if (options.argv === undefined) {
    options.argv = true;
  }
  if (options.print === undefined) {
    options.print = true;
  }

  if (   options.defaults
      && options.sources.indexOf('../conf/default') == -1) {
    options.sources.unshift('../conf/default');
  }

  options.sources.forEach(function(s) {
    this.process(require(s));
  }, this);

  if (options.argv) {
    var argv = require('minimist')
          (process.argv.slice(2),
            {
              'boolean': ['backfill', 'daemon', 'echo-post', 'tor']
            });

    this.process(argv);
  }

  if (options.print) {
    console.log(this);
  }

  if (resume !== undefined) {
    resume(this);
  }
}

configuration.prototype = {
  'include': function(inc) {
    if (Array.isArray(inc)) {
      inc.forEach(this.include, this);
    } else if (typeof inc === 'string') {
      try {
        this.process(require(inc));
      } catch (e) {
        console.log (e);
      }
    }
  },
  'json': function(json) {
    if (Array.isArray(json)) {
      json.forEach(this.json, this);
    } else if (typeof json === 'string') {
      try {
        this.process(JSON.parse(json));
      } catch (e) {
        console.log (e);
      }
    }
  },
  'process': function(argv) {
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
    if (argv.json) {
      this.json(argv.json);
    }
    if (argv.include) {
      this.include(argv.include);
    }
  }
};

module.exports = new configuration({}, function(conf) {
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
});
