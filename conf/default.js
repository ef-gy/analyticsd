module.exports = {
  'tail': ['/var/log/auth.log', '/var/log/daemon.log'],
  'tid': null,
  // 'endpoint': 'http://www.google-analytics.com/collect',
  'endpoint': 'https://ssl.google-analytics.com/collect',
  'payload': {
    'map': {
      'session': 'cid',
      'control': 'sc',
      'address': 'uip',
      'type': 't',
      'category': 'ec',
      'action': 'ea',
      'label': 'el',
      'page': 'p'
    }
  },
  'analyse': {
    'pattern': [
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: invalid user (.+) from (.+)/i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'InvalidUser',
                      'session': 3,
                      'address': 5 } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: received disconnect from ([^ ]+): .* bye bye .preauth./i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PreAuthDisconnect',
                      'session': 3,
                      'control': 'end',
                      'address': 4 } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: connection closed by (.+) .preauth./i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PreAuthClose',
                      'session': 3,
                      'control': 'end',
                      'address': 4 } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: received disconnect from (.+): .* normal shutdown.* .preauth./i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PreAuthNormalShutdown',
                      'session': 3,
                      'control': 'end',
                      'address': 4 } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: .+ received disconnect from (.+): .+ unable to connect using the available authentication methods/i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'NoSupportedAuthenticationMethods',
                      'session': 3,
                      'control': 'end',
                      'address': 4 } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: .* \[(.+)\] .* POSSIBLE BREAK-IN ATTEMPT.+/i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PossibleBreakInAttempt',
                      'session': 3,
                      'address': 4 } },
      { 'match': /(.+) ([^ ]+) scanlogd: (.+) to .+/,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'scanlogd',
                      'label': 'PortScan',
                      'session': '0',
                      'address': 3  } }
    ]
  },
  'user': 'daemon',
  'group': 'adm',
  'include': '/etc/analyticsd/analyticsd.js'
};
