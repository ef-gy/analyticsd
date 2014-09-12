var https = require('https'),
    url = require('url');

function convert (data) {
  var ret = 'v=1';

  if (data.session) {
    ret += '&cid=' + encodeURIComponent(data.session);
  }

  if (data.address) {
    ret += '&uip=' + encodeURIComponent(data.address);
  }

  if (data.date) {
    ret += '&qt=' + ((new Date()).getTime() - data.date.getTime());
  }

  if (data.type) {
    ret += '&t=' + data.type;
  }

  if (data.category) {
    ret += '&ec=' + encodeURIComponent(data.category);
  }

  if (data.action) {
    ret += '&ea=' + encodeURIComponent(data.action);
  }

  if (data.label) {
    ret += '&el=' + encodeURIComponent(data.label);
  }

  if (data.page) {
    ret += '&p=' + encodeURIComponent(data.page);
  }

  if (ret == 'v=1') {
    return false;
  }

  return ret;
}

function post (transport, endpoint, tid, payload, complete) {
  if (!complete) {
    complete = function (success) {};
  }

  if (!payload) {
    return complete(false);
  }

  payload += '&tid=' + encodeURIComponent(tid);

  console.log ('POST: ' + payload);

  var e = url.parse(endpoint);
  e.method = 'POST';

  var req = transport.request(e, function(r) {
  });

  req.write(payload);
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
}

function context (tid, endpoint, transport) {
  if (!endpoint) {
    endpoint = 'https://ssl.google-analytics.com/collect';
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
