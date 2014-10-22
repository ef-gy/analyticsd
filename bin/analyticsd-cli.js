#!/usr/bin/nodejs --expose-gc

if (typeof gc === 'function') {
  setInterval(function() {
    gc();
  }, 5000);
}

require('../lib/daemon').daemon();
