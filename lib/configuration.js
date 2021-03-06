var os = require('os'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    vm = require('vm'),
    fs = require('fs');

function configuration (options, resume) {
  this.payload = {
    'map': {}
  };
  this.analyse = {
    'periodic': {},
    'template': {},
    'pattern': [],
    'filter': [],
    'derive': [],
    'host': os.hostname()
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
      && options.sources.indexOf(require.resolve('../conf/default.json')) == -1) {
    options.sources.unshift(require.resolve('../conf/default.json'));
  }

  this.include(options.sources, function(on) {
    function finalise () {
      if (options.print) {
        console.log(on);
      }

      if (resume !== undefined) {
        return resume(on);
      }
    }

    if (options.argv) {
      var argv = require('minimist')
            (process.argv.slice(2),
              { 'boolean': ['backfill', 'daemon', 'echo-post', 'tor']
              });

      on.process(argv, finalise);
    } else {
      finalise();
    }
  });
}

configuration.prototype = {
  'seq': function(f, l, resume) {
    if (typeof l === 'string') {
      l = [l];
    }

    (function next(on) {
      if (l.length == 0) {
        resume(on);
      } else {
        var c = l.shift();
        try {
          f(c, on, next);
        } catch (e) {
          console.error (f, c, e);
          next(on);
        }
      }
    })(this);
  },
  'remoteJSON': function(c, on, next, transport) {
    transport.get(c, function(r) {
      var body = '';
      r.on('data', function(d) {
        body += d;
      });
      r.once('end', function() {
        on.process(JSON.parse(body), next);
      });
    }).once('error', function(e) {
      console.error(e);
      next(on);
    });
  },
  'include': function(inc, resume) {
    this.seq(function(c, on, next) {
      var u = url.parse(c);
      if (u.protocol === 'http:') {
        on.remoteJSON(c, on, next, http);
      } else if (u.protocol === 'https:') {
        on.remoteJSON(c, on, next, https);
      } else {
        fs.readFile(c, function(err, data) {
          if (err) {
            console.error(err);
            on.process({}, next);
          } else {
            on.process(JSON.parse(data), next);
          }
        });
      }
    }, inc, resume);
  },
  'json': function(json, resume) {
    this.seq(function(c, on, next) {
      var u = url.parse(c);
      if (u.protocol === 'http:') {
        on.remoteJSON(c, on, next, http);
      } else if (u.protocol === 'https:') {
        on.remoteJSON(c, on, next, https);
      } else {
        on.process(JSON.parse(c), next);
      }
    }, json, resume);
  },
  'process': function(argv, resume) {
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
    if (argv.domain) {
      this.domain = argv.domain;
    }
    if (argv.host) {
      this.host = argv.host;
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
        if (typeof argv.strip[index] === 'string') {
          argv.strip[index] = RegExp(argv.strip[index], 'i');
        }
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
        var p = argv.analyse.pattern[index];
        if (typeof p.match === 'string') {
          p.match = RegExp(p.match, 'i');
        }
        this.analyse.pattern.push(p);
      }
    }
    if (argv.analyse && argv.analyse.filter) {
      for (index in argv.analyse.filter) {
        var p = argv.analyse.filter[index];
        for (i2 in p) {
          if (typeof p[i2] === 'string') {
            p[i2] = RegExp(p[i2], 'i');
          }
        }
        this.analyse.filter.push(p);
      }
    }
    if (argv.analyse && argv.analyse.derive) {
      for (index in argv.analyse.derive) {
        var p = argv.analyse.derive[index];
        if (typeof p.page === 'string') {
          p.page = RegExp(p.page, 'i');
        }
        this.analyse.derive.push(p);
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
    var on = this;
    function includes () {
      if (argv.include) {
        on.include(argv.include, resume);
      } else if (resume !== undefined) {
        return resume(on);
      }
    }
    if (argv.json) {
      this.json(argv.json, includes);
    } else {
      includes();
    }
  }
};

module.exports = configuration;
