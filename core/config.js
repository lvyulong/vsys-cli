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
            name: 'port',
            message: '本地开发端口号: ',
        },
        {
            type: 'input',
            name: 'proxy',
            message: '本地开发代理: ',
        },

        // 后端接口基础url
        {
            type: 'input',
            name: 'apiBaseUrlLocal',
            default: '/api',
            message: 'api-base-url[local]: ',
        },
        {
            type: 'input',
            name: 'apiBaseUrlDevelop',
            default: '/api',
            message: 'api-base-url[develop]: ',
        },
        {
            type: 'input',
            name: 'apiBaseUrlTest',
            default: '/api',
            message: 'api-base-url[test]: ',
        },
        {
            type: 'input',
            name: 'apiBaseUrlProduction',
            default: '/api',
            message: 'api-base-url[production]:',
        },
        // 后端接口模块名
        {
            type: 'input',
            name: 'apiName',
            default: 'admin',
            message: '后端接口模块名: ',
        },
        // 前端资源访问路径
        {
            type: 'input',
            name: 'publicPathLocal',
            message: 'public-pach[local]: ',
        },
        {
            type: 'input',
            name: 'publicPathDevelop',
            default: '/admin',
            message: 'public-path[develop]: ',
        },
        {
            type: 'input',
            name: 'publicPathTest',
            default: '/admin',
            message: 'public-path[test]: ',
        },
        {
            type: 'input',
            name: 'publicPathProduction',
            default: '/admin',
            message: 'public-path[production]: ',
        }
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
        try {

            // build/base
            let buildBase = `${cwd}/dev/build/base.js`;
            handle.compile(buildBase, {
                publicPathLocal: answers.publicPathLocal,
                publicPathDevelop: answers.publicPathDevelop,
                publicPathTest: answers.publicPathTest,
                publicPathProduction: answers.publicPathProduction
            });
            // build/dev
            let buildDev = `${cwd}/dev/build/local.js`;
            handle.compile(buildDev, {
                proxy: answers.proxy,
                port: answers.port,
            });
            // src/config/sys
            let srcConfigEnv = `${cwd}/dev/src/config/env.js`;
            let sysOption = {
                apiBaseUrlLocal: answers.apiBaseUrlLocal,
                apiBaseUrlDevelop: answers.apiBaseUrlDevelop,
                apiBaseUrlTest: answers.apiBaseUrlTest,
                apiBaseUrlProduction: answers.apiBaseUrlProduction,

            };
            if (option.system) {
                sysOption.loginType = _.findWhere(config.loginType, {name: answers.loginType}).id;
            }
            handle.compile(srcConfigEnv, sysOption);

            // src/api 根据项目名，更改基础路径
            let apiFilePath = `${cwd}/dev/src/api`;
            let apiFiles = fs.readdirSync(apiFilePath);
            if (apiFiles && apiFiles.length > 0) {
                apiFiles.forEach(function (v) {
                    let apiItemPath = `${cwd}/dev/src/api/${v}`;
                    handle.compile(apiItemPath, {
                        apiName: answers.apiName,
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