const program = require('commander');   //用来处理命令行参数
const _ = require('underscore');
const chalk = require('chalk'); //用来给命令行提示改变颜色
const inquirer = require('inquirer');   //用来处理命令行交互
const symbols = require('log-symbols'); //用来给命令行提示信息添加小图标
const tool = require('../../tool');
const config = require('../../config');
const fs = require('fs');
let loginTypeNames = _.pluck(config.loginType, 'name');
function handleConfig(option) {
    let cwd = option && option.cwd || process.cwd();
    inquirer.prompt([
        {
            type: 'input',
            name: 'domain',
            message: 'devServer代理域名: ',

        },
        {
            type: 'input',
            name: 'port',
            message: 'devServer端口号: ',
        },
        {
            type: 'input',
            name: 'baseUrl',
            default: '/api',
            message: 'api基础路径: ',
        },
        {
            type: 'input',
            name: 'output',
            default: '../../../web/',
            message: '输出目录(相对路径): ',
        },
        {
            type: 'list',
            name: 'loginType',
            choices: loginTypeNames,
            message: '登录方式: ',
        },
    ]).then(function (answers) {
        tool.spinner.start(chalk.yellow.bold('正在项目配置...'));
        let pathArr = cwd.split('\\');
        let name = pathArr[pathArr.length - 1];
        try {
            // build/dev
            let buildDev = `${cwd}/build/dev.js`;
            tool.compile(buildDev, {
                domain: answers.domain,
                port: answers.port,
            });
            // build/prod
            let buildProd = `${cwd}/build/prod.js`;
            tool.compile(buildProd, {
                output: answers.output,
                name: name,
            });
            // src/config/sys
            let srcConfigSys = `${cwd}/src/config/sys.js`;
            tool.compile(srcConfigSys, {
                baseUrl: answers.baseUrl,
                loginType: _.findWhere(config.loginType, {name: answers.loginType}).id,
            });

            // src/api 根据项目名，更改基础路径
            let apiFilePath = `${cwd}/src/api`;
            let apiFiles = fs.readdirSync(apiFilePath);
            if (apiFiles && apiFiles.length > 0) {
                apiFiles.forEach(function (v) {
                    let apiItemPath = `${cwd}/src/api/${v}`;
                    tool.compile(apiItemPath, {
                        name: name,
                    });
                })
            }

            setTimeout(function () {
                tool.spinner.succeed(chalk.green.bold('项目配置完成'));
            }, 2000);
        } catch (e) {
            tool.spinner.fail(chalk.red.bold(e));
        }
    })
}


module.exports = {
    config: function () {
        // 项目配置
        program
            .command('config')
            .action(() => {
                handleConfig();
            })
    },
    handleConfig: handleConfig
};