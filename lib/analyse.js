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
  var match, out;

         if (match = /(.+) ([^ ]+) sshd.([0-9]+).: invalid user (.+) from (.+)/i.exec(line)) {
    out = {
      'date': match[1],
      'host': match[2],
      'type': 'event',
      'category': 'Service',
      'action': 'SSH',
      'label': 'InvalidUser',
      'session': match[3],
      'address': match[5]
    };
  } else if (match = /(.+) ([^ ]+) sshd.([0-9]+).: received disconnect from ([^ ]+): .* bye bye .preauth./i.exec(line)) {
    out = {
      'date': match[1],
      'host': match[2],
      'type': 'event',
      'category': 'Service',
      'action': 'SSH',
      'label': 'PreAuthDisconnect',
      'session': match[3],
      'address': match[4]
    };
  } else if (match = /(.+) ([^ ]+) sshd.([0-9]+).: connection closed by (.+) .preauth./i.exec(line)) {
    out = {
      'date': match[1],
      'host': match[2],
      'type': 'event',
      'category': 'Service',
      'action': 'SSH',
      'label': 'PreAuthClose',
      'session': match[3],
      'address': match[4]
    };
  } else if (match = /(.+) ([^ ]+) sshd.([0-9]+).: received disconnect from (.+): .* normal shutdown.* .preauth./i.exec(line)) {
    out = {
      'date': match[1],
      'host': match[2],
      'type': 'event',
      'category': 'Service',
      'action': 'SSH',
      'label': 'PreAuthNormalShutdown',
      'session': match[3],
      'address': match[4]
    };
  } else if (match = /(.+) ([^ ]+) sshd.([0-9]+).: .* \[(.+)\] .* POSSIBLE BREAK-IN ATTEMPT.+/i.exec(line)) {
    out = {
      'date': match[1],
      'host': match[2],
      'type': 'event',
      'category': 'Service',
      'action': 'SSH',
      'label': 'PossibleBreakInAttempt',
      'session': match[3],
      'address': match[4]
    };
  }

  if (!out) {
    out = {};
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
