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

  return ret;
}

function post (collector, tid, payload) {
  payload += '&tid=' + encodeURIComponent(tid);

  console.log (payload);
}

function context (tid, collector) {
  return {
    'post': function (payload) {
      return post (collector, tid, payload);
    }
  }
}

module.exports = {
  'convert': convert,
  'post': post,
  'context': context
};
