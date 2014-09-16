var configuration = require('./configuration'),
    os = require('os');

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

  out.raw = line;
  if (out.date) {
    out.date = parseTimestamp(out.date);
  }

  return out;
}

module.exports = {
  'analyse': analyse,
  'parseTimestamp': parseTimestamp
};
