const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);

const origLookup = dns.lookup;
dns.lookup = function(hostname, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return origLookup(hostname, options, cb);
  }

  dns.resolve4(hostname, (err, addrs) => {
    if (!err && addrs && addrs.length > 0) {
      if (options && options.all) {
        return cb(null, addrs.map(a => ({ address: a, family: 4 })));
      }
      return cb(null, addrs[0], 4);
    }
    origLookup(hostname, options, cb);
  });
};
