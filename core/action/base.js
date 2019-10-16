const program = require('commander');
const package = require('../../package');
module.exports = function () {
    program.version(package.version,'-v, --version');
};
