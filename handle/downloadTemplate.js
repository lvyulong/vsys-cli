const symbols = require('log-symbols'); //用来给命令行提示信息添加小图标
const chalk = require('chalk'); //用来给命令行提示改变颜色
const download = require('download-git-repo'); //用来从github下载模板
const fs = require('fs');
const config = require('../config');
const {exec} = require('child_process');
const ora = require('ora'); //用来提供loading图标
const spinner = ora();

module.exports = function (name, cmd,gitType) {
    var dest = `${process.cwd()}\\${name}`;
    var promise = new Promise(function (resolve, reject) {
        // 判断项目是否存在
        if (fs.existsSync(dest)) {
            console.log(symbols.error, chalk.red.bold('项目已存在'));
            reject();
            return;
        }
        spinner.start(chalk.yellow.bold("正在下载模板..."));
        download(config.git[gitType].url, dest,{clone:true}, (err) => {
            if (err) {
                spinner.fail(chalk.red.bold("下载模板失败"));
                console.error(err);
                reject();
            } else {
                spinner.succeed(chalk.green.bold("下载模板完成"));
                // 删除server doc目录,此步失败不会reject，因为不影响后续的操作
                exec('rd server doc \/s\/q', {cwd: `${process.cwd()}\\${name}`}, (error, stdout, stderr) => {
                    if (error) {
                        console.error(chalk.red.bold('优化模板文件失败'));
                        return;
                    }
                });
                resolve();
            }
        })
    });
    return promise;
};