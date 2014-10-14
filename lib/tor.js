var dns = require('dns');

function exitNode(source, destination, port, result) {
  dns.lookup
    (       source.split('.').reverse().join('.')
    + '.' + port
    + '.' + destination.split('.').reverse().join('.')
    + '.ip-port.exitlist.torproject.org',
    function(error, addresses) {
      if (!error) {
        if (addresses === '127.0.0.2') {
          return result(true);
        }
        else if (Array.isArray(addresses) && addresses.filter(function(address) { return address === '127.0.0.2'; })[0] ==='127.0.0.2') {
          return result(true);
        }
      }

      return result(false);
  });
}

module.exports = {
  'exitNode': exitNode
};
