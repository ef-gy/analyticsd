var tail = require('./lib/tail').tail,
    analyse = require('./lib/analyse').analyse;
var files = process.argv.slice(2);

for (i in files) {
  tail(files[i],
    function (line) {
      console.log(analyse(line));
    });
}
