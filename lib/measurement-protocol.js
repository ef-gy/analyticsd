var http = require('http'),
    https = require('https'),
    url = require('url'),
    configuration = require('./configuration'),
    querystring = require('querystring');

function convert (data, tid) {
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

function post (transport, endpoint, tid, payload) {
  if (typeof payload === 'object') {
    payload = convert(payload, tid);
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

function context (tid, endpoint, transport) {
  if (!endpoint) {
    endpoint = configuration.endpoint;
  }

  if (typeof endpoint === 'string') {
    endpoint = url.parse(endpoint);
    endpoint.method = 'POST';
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

  return {
    'convert': function (data) {
      return convert (data, tid);
    },
    'post': function (payload) {
      return post (transport, endpoint, tid, payload);
    }
  }
}

module.exports = {
  'convert': convert,
  'post': post,
  'context': context
};
