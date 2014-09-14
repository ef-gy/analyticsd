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
  }
};
