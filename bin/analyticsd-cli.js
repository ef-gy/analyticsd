#!/usr/bin/env nodejs

var tail = require('../lib/tail').tail,
    analyse = require('../lib/analyse'),
    mp = require('../lib/measurement-protocol'),
    configuration = require('../lib/configuration');

(function (context) {
  if (configuration.tail.length > 0) {
    tail(configuration.tail,
         function (line) { return context.post(analyse.analyse(line)); },
         null, configuration.backfill);
  }

  for (i in configuration.analyse.periodic) {
    if (configuration.analyse.periodic[i]) {
      function run(f,p) {
        f(context).forEach(function(analysis) {
          context.post(analysis);
        });
        setTimeout(run, p, f, p, context);
      };
      run(analyse[i], configuration.analyse.periodic[i], context);
    }
  }
})(mp.context(configuration.tid));
