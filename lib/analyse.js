var configuration = require('./configuration'),
    os = require('os'),
    fs = require('fs');

function parseTimestamp(date) {
  var match;

  if (match = /(...) (..) (..):(..):(..)/i.exec(date)) {
    var month = 0;

           if (match[1] == 'Jan') {
      month = 0;
    } else if (match[1] == 'Feb') {
      month = 1;
    } else if (match[1] == 'Mar') {
      month = 2;
    } else if (match[1] == 'Apr') {
      month = 3;
    } else if (match[1] == 'May') {
      month = 4;
    } else if (match[1] == 'Jun') {
      month = 5;
    } else if (match[1] == 'Jul') {
      month = 6;
    } else if (match[1] == 'Aug') {
      month = 7;
    } else if (match[1] == 'Sep') {
      month = 8;
    } else if (match[1] == 'Oct') {
      month = 9;
    } else if (match[1] == 'Nov') {
      month = 10;
    } else if (match[1] == 'Dec') {
      month = 11;
    }

    var now = new Date();
    date = new Date(now.getFullYear(), month, match[2], match[3], match[4], match[5]);
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

  if (out.date) {
    out.date = parseTimestamp(out.date);
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

