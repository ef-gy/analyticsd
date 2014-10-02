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
      'value': 'ev',
      'page': 'p',
      'agent': 'ua',
      'referrer': 'dr',
      'version': 'av',
      'non-interactive': 'ni'
    }
  },
  'strip': {
    'favicon': /favicon.ico/,
    'robots': /robots.txt/,
    'assets-pre': /\/(jpeg|jpg|css|js|script|png)\/.*/i,
    'assets-post': /.+\.(jpeg|jpg|css|js|png|gif)$/i,
  },
  'analyse': {
    'periodic': {
      'cpu-timing': 600000,
      'bandwidth': 1000000
    },
    'template': {
      'page': [ '/virtual/', 'action', ':', 'host' ],
      'session': [ 'host' ]
    },
    'pattern': [
      // OpenSSH patterns
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
                      'address': 4,
                      'non-interactive': '1' } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: connection closed by (.+) .preauth./i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PreAuthClose',
                      'session': 3,
                      'control': 'end',
                      'address': 4,
                      'non-interactive': '1' } },
      { 'match': /(.+) ([^ ]+) sshd.([0-9]+).: received disconnect from (.+): .* normal shutdown.* .preauth./i,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'SSH',
                      'label': 'PreAuthNormalShutdown',
                      'session': 3,
                      'control': 'end',
                      'address': 4,
                      'non-interactive': '1' } },
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
      // scanlogd patterns
      { 'match': /(.+) ([^ ]+) scanlogd: (.+) to .+/,
        'template': { 'date': 1,
                      'host': 2,
                      'type': 'event',
                      'category': 'Service',
                      'action': 'scanlogd',
                      'label': 'PortScan',
                      'session': '0',
                      'address': 3  } },
      // kippo log patterns
      { 'match': /([^ ]+ [^ ]+) .+,(.+). .+ trying auth (.+)/,
        'template': { 'date': 1,
                      'session': '0',
                      'type': 'event',
                      'category': 'HoneypotService',
                      'action': 'SSH',
                      'label': [ 'TryingAuth:', 3 ],
                      'address': 2 } },
      { 'match': /([^ ]+ [^ ]+) .+,([0-9]+),(.+). login attempt \[(.+)\/(.+)\] failed/,
        'template': { 'date': 1,
                      'session': 2,
                      'type': 'event',
                      'category': 'HoneypotService',
                      'action': 'SSH',
                      'label': [ 'LoginAttemptFailed:', 4, ':', 5 ],
                      'address': 3,
                      'user': 4,
                      'password': 5 } },
      { 'match': /([^ ]+ [^ ]+) .+,([0-9]+),(.+). login attempt \[(.+)\/(.+)\] succeeded/,
        'template': { 'date': 1,
                      'session': 2,
                      'type': 'event',
                      'category': 'HoneypotService',
                      'action': 'SSH',
                      'label': [ 'LoginAttemptSucceeded:', 4, ':', 5 ],
                      'address': 3,
                      'user': 4,
                      'password': 5 } },
      { 'match': /([^ ]+ [^ ]+) .+,([0-9]+),(.+). connection lost/,
        'template': { 'date': 1,
                      'session': 2,
                      'type': 'event',
                      'category': 'HoneypotService',
                      'action': 'SSH',
                      'label': 'ConnectionLost',
                      'address': 3,
                      'non-interactive': '1' } },
      // HTTP logs, 'combined' format
      { 'match': /([^ ]+) - ([^ ]+) \[(.+)\] "([^ ]+) (.+) ([^ ]+)" ([0-9]+) ([0-9]+) "(.+)" "(.+)"/,
        'template': { 'date': 3,
                      'session': [ 1, 2, 10 ],
                      'type': 'pageview',
                      'page': 5,
                      'address': 1,
                      'agent': 10,
                      'user': 2,
                      'method': 4,
                      'protocol': 6,
                      'referrer': 9,
                      'status': 7,
                      'size': 8 } }
    ],
    'filter': [
      { 'status': /^(1[0-9]{2}|30[1237])$/ }
    ],
    'derive': [
      { 'page': /(\/(atom|rss)\/|\.(atom|rss)$|sitemap\.xml$)/,
        'non-interactive': '1' }
    ]
  },
  'threshold': {
    'cpu-time': 50000,
    'bandwidth': 0
  },
  'user': 'daemon',
  'group': 'adm',
  'daemon': false,
  'pid': '/var/run/analyticsd.pid',
  'include': '/etc/analyticsd/analyticsd.js',
  'echo-post': false,
  'tor': false
};
