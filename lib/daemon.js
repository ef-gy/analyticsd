var tail = require('../lib/tail').tail,
    analyse = require('../lib/analyse'),
    mp = require('../lib/measurement-protocol'),
    configuration = require('../lib/configuration');

function daemon (conf, context) {
  if (conf === undefined) {
    return new configuration({}, function(conf) {
      if (conf.daemon) {
        require('daemon')();

        try {
          require('fs').writeFile(conf.pid, process.pid, console.error); 
        } catch (error) {
          console.error(error);
        }
      }

      try {
        process.setgid(conf.group);
        process.setuid(conf.user);
      } catch (e) {
        console.log('ERROR: could not set user/group.');
        console.log(e);
      }

      return daemon(conf, context);
    });
  }

  if (context === undefined) {
    return daemon(conf, new mp.context(conf.tid, false, false, conf));
  }

  if (conf.tail.length > 0) {
    tail(conf.tail,
         function (line) { return analyse.analyse(line, context, conf); },
         null, conf.backfill);
  }

  for (i in conf.analyse.periodic) {
    if (conf.analyse.periodic[i]) {
      function run(f,p) {
        f(context, conf);
        setTimeout(run, p, f, p, context);
      };
      run(analyse[i], conf.analyse.periodic[i], context);
    }
  }
}

module.exports = {
  'daemon': daemon
};
