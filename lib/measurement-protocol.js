var http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring'),
    version = require('../package.json')['version'];

// var hd = require('heapdump');

function convert (data, tid, configuration) {
  var payload = {'v': 1};

  if (data.date) {
    payload.qt = ((new Date()).getTime() - data.date.getTime());
  }

  for (i in configuration.payload.map) {
    if (data[i]) {
      payload[configuration.payload.map[i]] = data[i];
    }
  }

  if (Object.keys(payload).length < 2) {
    return false;
  }

  if (tid) {
    payload.tid = tid;
  }

  return querystring.stringify(payload);
}

function post (transport, endpoint, tid, payload, configuration) {
  if (typeof payload === 'object') {
    payload = convert(payload, tid, configuration);
  }

  if (!payload) {
    return false;
  }

  if (configuration['echo-post']) {
    console.log('POST: ' + payload);
  }

  var req = transport.request(endpoint);

  req.once('error', console.error);

  req.end(payload);

  return req;
}

function context (tid, endpoint, transport, configuration) {
  if (!endpoint) {
    endpoint = configuration.endpoint;
  }

  if (typeof endpoint === 'string') {
    endpoint = url.parse(endpoint);
    endpoint.method = 'POST';
    endpoint.headers = { 'user-agent': 'analyticsd/' + version };
  }

  if (!transport) {
    if (endpoint.protocol === 'http:') {
      transport = http;
    } else if (endpoint.protocol === 'https:') {
      transport = https;
    } else {
      throw new Error('Cannot guess transport for scheme "' + endpoint.protocol + '".');
    }
  }

  this.tid = tid;
  this.configuration = configuration;
  this.transport = transport;
  this.endpoint = endpoint;
}

context.prototype = {
  'convert': function (data) {
    return convert (data, this.tid, this.configuration);
  },
  'post': function (payload) {
    return post (this.transport, this.endpoint, this.tid, payload, this.configuration);
  }
};

module.exports = {
  'convert': convert,
  'post': post,
  'context': context
};
