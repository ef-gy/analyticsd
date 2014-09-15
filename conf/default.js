module.exports = {
  'tail': ['/var/log/auth.log', '/var/log/daemon.log'],
  'tid': null,
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
  'group': 'adm'
};
