var spawn = require('child_process').spawn,
    readline = require('readline');

function tail (file, line, close) {
  var t = spawn('tail', ['-F', file]);

  linereader = readline.createInterface(t.stdout, t.stdin);

  linereader.on('line', line);

  if (close) {
    t.on('close', close);
  }
}

module.exports = {
  'tail': tail
};
