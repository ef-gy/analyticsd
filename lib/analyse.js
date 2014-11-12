var os = require('os'),
    fs = require('fs'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    tor = require('./tor');

function uuidify(s) {
  if (uuid.unparse(uuid.parse(s)) == s) {
    return s;
  }

  var md5 = crypto.createHash('md5');
  md5.update(s, 'utf8');

  return uuid.v4({'random': md5.digest()});
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

function augment (out, context, configuration) {
  if (!out.host) {
    out.host = configuration.host;
  }

  for (index in configuration.analyse.template) {
    if (!out[index]) {
      out[index] = '';
      configuration.analyse.template[index].forEach(function(value){
        if (out[value]) {
          out[index] += out[value].toLowerCase();
        } else if (configuration[value]) {
          out[index] += configuration[value].toLowerCase();
        } else {
          out[index] += value;
        }
      });
    }
  }

  for (index in configuration.analyse.derive) {
    var f = configuration.analyse.derive[index];
    var all = true;
    var set = {};
    for (m in f) {
      if (typeof f[m] === 'string') {
        set[m] = f[m];
      }
      else if (!(out[m] && f[m].test(out[m]))) {
        all = false;
      }
    }
    if (all) {
      for (m in set) {
        out[m] = set[m];
      }
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

  if (out.session) {
    out.session = uuidify(out.session);
  }

  function resume() {
    if (out.date) {
      out.date = parseTimestamp(out.date);
    }

    return context.post(out);
  }

  if (out.address && /^(10\.|172\.(1[6-9]|2[0-9]|3[01])|192\.168\.)/.test(out.address)) {
    out.network = 'private';
    return resume();
  } else if (configuration.tor) {
    if (out.address) {
      if (/^(127\.)/.test(out.address)) {
        out.network = 'hidden-service';
        return resume();
      } else return tor.exitNode(out.address, configuration.ip, 80, function(viaTor) {
        out.network = viaTor ? 'tor' : 'internet';
        return resume();
      });
    } else {
      out.network = 'unknown';
      return resume();
    }
  } else if (out.address && /^(127\.|::1$)/.test(out.address)) {
    out.network = 'loopback';
    return resume();
  } else {
    out.network = 'unknown';
    return resume();
  }
}

function analyse (line, context, configuration) {
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

  return augment(out, context, configuration);
}

module.exports = {
  'analyse': analyse,
  'parseTimestamp': parseTimestamp,
  'augment': augment
};

(function periodic () {
  var cput = false;

  module.exports['cpu-timing'] = function (context, configuration) {
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
      augment({
        'non-interactive': '1',
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'UserTime',
        'value': duser }, context, configuration);
    }
    if (dnice > 0) {
      augment({
        'non-interactive': '1',
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'NiceTime',
        'value': dnice }, context, configuration);
    }
    if (dsys > 0) {
      augment({
        'non-interactive': '1',
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'SystemTime',
        'value': dsys }, context, configuration);
    }
    if (dirq > 0) {
      augment({
        'non-interactive': '1',
        'type': 'event',
        'category': 'System',
        'action': 'CPU',
        'label': 'IRQTime',
        'value': dirq }, context, configuration);
    }

    return out;
  }

  var bandwidtht = false;

  module.exports['bandwidth'] = function (context, configuration) {
    fs.readFile('/proc/net/netstat', function(error, data) {
      if (data === undefined) {
        console.error(error);
        return;
      }
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
              augment({
               'non-interactive': '1',
               'type': 'event',
               'category': 'System',
               'action': 'Network',
               'label': i,
               'value': diff }, context, configuration);
            }
          }
        }
      }
    });
    return [];
  }
})();

