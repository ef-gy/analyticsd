#!/usr/bin/nodejs --expose-gc

if (typeof gc === 'function') {
  setInterval(function() {
    gc();
  }, 5000);
}

try {
  require('heapdump');
} catch (e) {
  console.log (e);
}

process.title = 'analyticsd';

require('../lib/daemon').daemon();
