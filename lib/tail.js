var spawn = require('child_process').spawn,
    readline = require('readline');

function tail (file, line, close, full) {
  var t = spawn('tail', full ? ['-F', '-n', '+0', file] : ['-F', '-n', '0', file]);

  linereader = readline.createInterface(t.stdout, t.stdin);

  linereader.on('line', line);

  if (close) {
    t.on('close', close);
  }
}

module.exports = {
  'tail': tail
};
