var configuration = require('./configuration'),
    os = require('os'),
    fs = require('fs'),
    md5 = require('MD5'),
    uuid = require('node-uuid');

function uuidify(s) {
  if (uuid.unparse(uuid.parse(s)) == s) {
    return s;
  }

  var m = md5(s), a = [];

  for (i = 0; i < m.length; i+=2) {
    a.push(parseInt(m[i] + m[(i+1)], 16));
  }

  return uuid.v4({'random': a});
}

function parseMonth(month) {
         if (month == 'Jan') {
    month = 0;
  } else if (month == 'Feb') {
    month = 1;
  } else if (month == 'Mar') {
    month = 2;
  } else if (month == 'Apr') {
    month = 3;
  } else if (month == 'May') {
    month = 4;
  } else if (month == 'Jun') {
    month = 5;
  } else if (month == 'Jul') {
    month = 6;
  } else if (month == 'Aug') {
    month = 7;
  } else if (month == 'Sep') {
    month = 8;
  } else if (month == 'Oct') {
    month = 9;
  } else if (month == 'Nov') {
    month = 10;
  } else if (month == 'Dec') {
    month = 11;
  }

  return month;
}

function parseTimestamp(date) {
  var match;

  if (match = /(...) (..) (..):(..):(..)/i.exec(date)) {
    var month = parseMonth(match[1]);
    var now = new Date();
    date = new Date(now.getFullYear(), month, match[2], match[3], match[4], match[5]);
  } else if (match = /(..)\/(...)\/(....):(..):(..):(..)/i.exec(date)) {
    var month = parseMonth(match[2]);
    date = new Date(match[3], month, match[1], match[4], match[5], match[6]);
  } else {
    date = new Date(date);
  }

  return date;
}

function augment (out) {
  if (!out.host) {
    out.host = os.hostname();
  }

  for (index in configuration.analyse.template) {
    if (!out[index]) {
      out[index] = '';
      configuration.analyse.template[index].forEach(function(value){
        if (out[value]) {
          out[index] += out[value].toLowerCase();
        } else {
          out[index] += value;
        }
      });
    }
  }

  for (index in configuration.strip) {
    if (configuration.strip[index].test(out.page)) {
      return false;
    }
  }

  for (index in configuration.analyse.filter) {
    var f = configuration.analyse.filter[index];
    var all = true;
    for (m in f) {
      if (!(out[m] && f[m].test(out[m]))) {
        all = false;
      }
    }
    if (all) {
      return false;
    }
  }

  if (out.date) {
    out.date = parseTimestamp(out.date);
  }

  if (out.session) {
    out.session = uuidify(out.session);
  }

  return out;
}

function analyse (line) {
  var match, out = {};

  if (!configuration.analyse.pattern.some(function(p) {
      if (match = p.match.exec(line)) {
        for (i in p.template) {
          if (typeof p.template[i] === 'number') {
            out[i] = match[p.template[i]];
          } else if (Array.isArray(p.template[i])) {
            out[i] = '';
            p.template[i].forEach(function(value) {
              if (typeof value === 'number') {
                out[i] += match[value];
              } else {
                out[i] += value;
              }
            });
          } else {
            out[i] = p.template[i];
          }
        }

        return true;
      }

      return false;
    }, this)) {
    return {
      'raw': line
    };
  }

  out.raw = line;

  return augment(out);
}

module.exports = {
  'analyse': analyse,
  'parseTimestamp': parseTimestamp,
  'augment': augment
};

(function periodic () {
  var cput = false;

  module.exports['cpu-timing'] = function () {
    var ccpu = {
      'user': 0,
      'nice': 0,
      'sys':  0,
      'irq':  0
    };

    os.cpus().forEach(function(value) {
      ccpu.user += value.times.user;
      ccpu.nice += value.times.nice;
      ccpu.sys  += value.times.sys;
      ccpu.irq  += value.times.irq;
    });

    if (cput == false) {
      cput = ccpu;
      return [];
    }

    var duser = ccpu.user - cput.user;
    var dnice = ccpu.nice - cput.nice;
    var dsys  = ccpu.sys  - cput.sys;
    var dirq  = ccpu.irq  - cput.irq;

    cput = ccpu;

    var out = [];

    if (configuration.threshold['cpu-time']) {
      if (duser < configuration.threshold['cpu-time']) {
        cput.user -= duser;
        duser = 0;
      }
      if (dnice < configuration.threshold['cpu-time']) {
        cput.nice -= dnice;
        dnice = 0;
      }
      if (dsys < configuration.threshold['cpu-time']) {
        cput.sys -= dsys;
        dsys = 0;
      }
      if (dirq < configuration.threshold['cpu-time']) {
        cput.irq -= dirq;
        dirq = 0;
      }
    }

    if (duser > 0) {
      out.push (augment({
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'UserTime',
        'value': duser }));
    }
    if (dnice > 0) {
      out.push (augment({
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'NiceTime',
        'value': dnice }));
    }
    if (dsys > 0) {
      out.push (augment({
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'SystemTime',
        'value': dsys }));
    }
    if (dirq > 0) {
      out.push (augment({
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'IRQTime',
        'value': dirq }));
    }

    return out;
  }

  var bandwidtht = false;

  module.exports['bandwidth'] = function (context) {
    fs.readFile('/proc/net/netstat', function(error, data) {
      data = data.toString();
      if (typeof data === 'string') {
        var parsed = {};
        data.split("\n").forEach(function(line) {
          var d = line.split(' ');
          var h = d.shift();
          if (parsed[h]) {
            var n = {};
            parsed[h].forEach(function(v,i) {
              n[v] = parseInt(d[i]);
            });
            parsed[h] = n;
          } else {
            parsed[h] = d;
          }
        });
        var flat = {};
        for (i in parsed) {
          for (n in parsed[i]) {
            flat[n] = parsed[i][n];
          }
        }
        if (!bandwidtht) {
          bandwidtht = flat;
        } else {
          for (i in flat) {
            diff = flat[i] - bandwidtht[i];
            if (diff > configuration.threshold.bandwidth) {
              bandwidtht[i] += diff;
              context.post (augment({
               'type': 'event',
               'category': 'System',
               'action': 'Network',
               'label': i,
               'value': diff }));
            }
          }
        }
      }
    });
    return [];
  }
})();

