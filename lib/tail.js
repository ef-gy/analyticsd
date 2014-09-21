var spawn = require('child_process').spawn,
    readline = require('readline');

function tail (file, line, close, full) {
  var p = full ? ['-F', '-n', '+0', '-q'] : ['-F', '-n', '0', '-q'];
  p = p.concat(Array.isArray(file) ? file : [file]);

  var t = spawn('tail', p);

  linereader = readline.createInterface(t.stdout, t.stdin);

  linereader.on('line', line);

  if (close) {
    t.on('close', close);
  }
}

module.exports = {
  'tail': tail
};
