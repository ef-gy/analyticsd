var tail = require('./lib/tail').tail,
    analyse = require('./lib/analyse').analyse,
    mp = require('./lib/measurement-protocol');
var files = process.argv.slice(2);

var context = mp.context('frob');

for (i in files) {
  tail(files[i],
    function (line) {
      var analysis = analyse(line);
      console.log(analysis);
      console.log(mp.convert(analysis));
      context.post(mp.convert(analysis));
    });
}
