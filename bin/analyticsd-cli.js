#!/usr/bin/env nodejs

var tail = require('../lib/tail').tail,
    analyse = require('../lib/analyse').analyse,
    mp = require('../lib/measurement-protocol'),
    configuration = require('../lib/configuration'),
    context = mp.context(configuration.tid);

configuration.tail.forEach(function(value) {
  tail(value,
       function (line) {
         var analysis = analyse(line);
         context.post(mp.convert(analysis));
       },
       null, configuration.backfill);
});
