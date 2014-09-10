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
      'address': match[4]
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
      'address': match[5]
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

  return out;
}

module.exports = {
  'analyse': analyse
};
