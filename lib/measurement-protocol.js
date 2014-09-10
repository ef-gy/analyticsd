var https = require('https');

function convert (data) {
  var ret = 'v=1';

  if (data.session) {
    ret += '&cid=' + encodeURIComponent(data.session);
  }

  if (data.uip) {
    ret += '&uip=' + encodeURIComponent(data.uip);
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
