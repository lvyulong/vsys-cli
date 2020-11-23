const program = require('commander');   //用来处理命令行参数
const _ = require('underscore');
const chalk = require('chalk'); //用来给命令行提示改变颜色
const inquirer = require('inquirer');   //用来处理命令行交互
const handle = require('../handle');
const config = require('../config/index');
const fs = require('fs');
const {exec} = require('child_process');
const ora = require('ora'); //用来提供loading图标
const spinner = ora();
const loginTypeNames = _.pluck(config.loginType, 'name');
const projectTypeNames = _.pluck(config.projectType, 'name');

function handleConfig(option) {
    let cwd = option && option.cwd || process.cwd();
    let configs = [
        {
            type: 'input',
            name: 'apiName',
            message: 'api模块名(如admin/app等): ',
        },
        {
            type: 'input',
            name: 'port',
            message: 'devServer端口号: ',
        },
        {
            type: 'input',
            name: 'domain',
            message: 'devServer代理域名: ',
        },
        {
            type: 'input',
            name: 'devBaseUrl',
            default: '/api',
            message: 'dev - api基础路径: ',
        },
        {
            type: 'input',
            name: 'testBaseUrl',
            message: 'test - api基础路径: ',
        },
        {
            type: 'input',
            name: 'prodBaseUrl',
            message: 'prod - api基础路径: ',
        },
    ];
    if (option.system) {
        configs.push({
            type: 'list',
            name: 'loginType',
            choices: loginTypeNames,
            message: '登录方式: ',
        });
    }
    inquirer.prompt(configs).then(function (answers) {
        spinner.start(chalk.yellow.bold('正在项目配置...'));
        let pathArr = cwd.split('\\');
        let name = pathArr[pathArr.length - 1];
        try {
            // build/dev
            let buildDev = `${cwd}/build/dev.js`;
            handle.compile(buildDev, {
                domain: answers.domain,
                port: answers.port,
            });
            // build/prod
            let buildProd = `${cwd}/build/prod.js`;
            handle.compile(buildProd, {
                output: answers.output,
                name: name,
            });
            // src/config/sys
            let srcConfigSys = `${cwd}/src/config/sys.js`;
            let sysOption = {
                devBaseUrl: answers.devBaseUrl,
                testBaseUrl: answers.testBaseUrl,
                prodBaseUrl: answers.prodBaseUrl,
                sysName: answers.sysName,
            };
            if (option.system) {
                sysOption.loginType = _.findWhere(config.loginType, {name: answers.loginType}).id;
            }
            handle.compile(srcConfigSys, sysOption);

            // src/main
            let srcMainJs = `${cwd}/src/main.js`;
            handle.compile(srcMainJs, {
                domain: answers.domain
            });

            // src/api 根据项目名，更改基础路径
            let apiFilePath = `${cwd}/src/api`;
            let apiFiles = fs.readdirSync(apiFilePath);
            if (apiFiles && apiFiles.length > 0) {
                apiFiles.forEach(function (v) {
                    let apiItemPath = `${cwd}/src/api/${v}`;
                    handle.compile(apiItemPath, {
                        name: answers.apiName,
                    });
                })
            }
            spinner.succeed(chalk.green.bold('项目配置完成'));
            // 询问是否下载依赖
            inquirer.prompt([
                {
                    type: 'list',
                    choices: ["Yes", "No"],
                    name: 'downloadDep',
                    message: '是否立即下载依赖？'
                },
            ]).then(function (answers) {
                if (answers.downloadDep == 'Yes') {
                    spinner.start(chalk.yellow.bold('正在下载依赖...'));
                    exec('npm install', {cwd: cwd}, (error, stdout, stderr) => {
                        if (error) {
                            console.error(chalk.red.bold('依赖下载失败'));
                            return;
                        }
                        console.log(stdout);
                        console.log(stderr);
                        spinner.succeed(chalk.green.bold('依赖下载完成'));
                    });
                }
            });
        } catch (e) {
            spinner.fail(chalk.red.bold(e));
        }
    })
}

module.exports = {
    config: function () {
        // 项目配置
        program
            .command('config')
            .option('-m, --mobile', '配置移动端项目')
            .option('-s, --system', '配置管理系统')
            .action((cmd) => {
                if (cmd.system) {
                    handleConfig({
                        system: cmd.system,
                    });
                } else if (cmd.mobile) {
                    handleConfig({
                        mobile: cmd.mobile,
                    });
                } else {
                    inquirer.prompt([
                        {
                            type: 'list',
                            choices: projectTypeNames,
                            name: 'projectType',
                            message: '请选择项目类型: '
                        },
                    ]).then(function (answers) {
                        var projectType = _.findWhere(config.projectType, {name: answers.projectType}).id;
                        if (projectType == 'system') {
                            // 管理系统项目
                            handleConfig({
                                system: true,
                            });

                        } else if (projectType == 'mobile') {
                            // 移动端项目
                            handleConfig({
                                mobile: true,
                            });
                        }
                    });
                }
            })
    },
    handleConfig: handleConfig
};