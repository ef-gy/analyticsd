var configuration = require('./configuration');

function parseSyslogTimesstamp(date) {
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
  }

  return date;
}

function analyse (line) {
  var match, out = {};

  configuration.analyse.pattern.some(function(p) {
    if (match = p.match.exec(line)) {
      for (i in p.template) {
        if (typeof p.template[i] === 'number') {
          out[i] = match[p.template[i]];
        } else {
          out[i] = p.template[i];
        }
      }

      return true;
    }

    return false;
  }, this);

  if (!out.page && out.action && out.host) {
    out.page = '/virtual/' + out.action.toLowerCase() + ':' + out.host.toLowerCase();
  }

  out.raw = line;
  if (out.date) {
    out.date = parseSyslogTimesstamp(out.date);
  }

  return out;
}

module.exports = {
  'analyse': analyse,
  'parseSyslogTimesstamp': parseSyslogTimesstamp
};
