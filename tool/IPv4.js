const os = require('os');
const _ = require('underscore');
module.exports = function () {
    var nets = os.networkInterfaces()['以太网'];
    var ipv4 = _.findWhere(nets,{family:'IPv4'});
    return ipv4.address;
};