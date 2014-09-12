#!/usr/bin/env nodejs

var tail = require('./lib/tail').tail,
    analyse = require('./lib/analyse').analyse,
    mp = require('./lib/measurement-protocol');

if (process.argv.length < 3) {
    console.log(process.argv[1] + ' TID [log...]');
    return;
}

var files = process.argv.slice(3),
    context = mp.context(process.argv[2]);

for (i in files) {
  tail(files[i],
    function (line) {
      var analysis = analyse(line);
      context.post(mp.convert(analysis));
    });
}
