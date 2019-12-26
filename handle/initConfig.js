const chalk = require('chalk'); //用来给命令行提示改变颜色
const ora = require('ora'); //用来提供loading图标
const spinner = ora();
const compile = require('./compile');
const IPv4 = require('./IPv4');
module.exports = function (name,cmd,type,answers) {
    var promise = new Promise(function (resolve, reject) {
        spinner.start(chalk.yellow.bold("正在初始化项目..."));
        // package.json替换
        let pkg = `${process.cwd()}\\${name}\\package.json`;
        compile(pkg, {
            name,
            description: answers.description,
            author: answers.author
        });
        // build/base替换
        let buildBase = `${process.cwd()}\\${name}\\build\\base.js`;
        compile(buildBase, {name});

        // main.js替换
        let mainJs = `${process.cwd()}\\${name}\\src\\main.js`;
        compile(mainJs, {
            ip: IPv4(),
            domain: '{{domain}}',    // 防止被替换成空字符串，这个属性在vs config时才替换
        });
        spinner.succeed(chalk.green.bold("项目初始化完成"));
        resolve();
    });
    return promise;
};