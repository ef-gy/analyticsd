var https = require('https'),
    url = require('url'),
    configuration = require('./configuration'),
    querystring = require('querystring');

function convert (data) {
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

  return querystring.stringify(payload);
}

function post (transport, endpoint, tid, payload, complete) {
  if (!complete) {
    complete = function (success) {};
  }

  if (!payload) {
    return complete(false);
  }

  payload += '&tid=' + encodeURIComponent(tid);

  var req = transport.request(endpoint);

  req.on('error', function(e) {
    console.error(e);
  });

  req.write(payload);
  req.end();
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
    transport = https;
  }

  return {
    'post': function (payload, complete) {
      return post (transport, endpoint, tid, payload, complete);
    }
  }
}

module.exports = {
  'convert': convert,
  'post': post,
  'context': context
};
