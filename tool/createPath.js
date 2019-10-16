const fs = require('fs');
const chalk = require('chalk');
const _ = require('underscore');
module.exports = function (path, callback) {
    function DirIsExist () {
        try {
            fs.accessSync(path, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    }
    var pathArray = path.split('/');
    var url = `src/views`;
    for (let i = 0; i < pathArray.length; i++) {
        url = `${url}/${pathArray[i]}`;
        if (!DirIsExist(url)) {
            try {
                fs.mkdirSync(url)
            } catch (err) {
                console.log(chalk.red(err))
            }
        }
    }
    callback && callback(url);


};