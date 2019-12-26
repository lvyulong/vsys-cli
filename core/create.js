const program = require('commander');
const _ = require('underscore');
//用来处理命令行交互
const inquirer = require('inquirer');
const handle = require('../handle');
const coreConfig = require('./config');
const config = require('../config');
const projectTypeNames = _.pluck(config.projectType, 'name');

// 管理系统
function handleSystem(name, cmd) {
    // 询问必要的信息
    inquirer.prompt([
        {
            type: 'input',
            name: 'author',
            message: 'author: '
        },
        {
            type: 'input',
            name: 'description',
            message: 'description: '
        }
    ]).then((answers) => {
        // 从git下载模板，并删除不必要的文件（doc/server）
        handle.downloadTemplate(name, cmd, 'system').then(function () {
            // 初始化配置
            return handle.initConfig(name, cmd, 'system', answers);
        }).then(function () {
            // 询问是否立即配置项目
            inquirer.prompt([
                {
                    type: 'list',
                    choices: ["Yes", "No"],
                    name: 'startConfig',
                    message: '是否立即进行项目配置？'
                },
            ]).then(function (answers) {
                if (answers.startConfig == 'Yes') {
                    coreConfig.handleConfig({
                        cwd: `${process.cwd()}\\${name}`,
                        system: true,
                    });
                }
            })
        });
    })
}

function handleMobile(name, cmd) {
    // 询问必要的信息
    inquirer.prompt([
        {
            type: 'input',
            name: 'author',
            message: 'author: '
        },
        {
            type: 'input',
            name: 'description',
            message: 'description: '
        }
    ]).then((answers) => {
        // 从git下载模板，并删除不必要的文件（doc/server）
        handle.downloadTemplate(name, cmd, 'mobile').then(function () {
            // 初始化配置
            return handle.initConfig(name, cmd, 'mobile', answers);
        }).then(function () {
            // 询问是否立即配置项目
            inquirer.prompt([
                {
                    type: 'list',
                    choices: ["Yes", "No"],
                    name: 'startConfig',
                    message: '是否立即进行项目配置？'
                },
            ]).then(function (answers) {
                if (answers.startConfig == 'Yes') {
                    coreConfig.handleConfig({
                        cwd: `${process.cwd()}\\${name}`,
                        mobile: true,
                    });
                }
            })
        });
    })
}

module.exports = function () {
    // 创建新项目
    program
        .command('create <name>')
        .option('-m, --mobile', '构建移动端项目')
        .option('-s, --system', '构建管理系统')
        .action((name, cmd) => {
            var useMobile = cmd.mobile;
            var useSystem = cmd.system;
            if (useMobile) {
                // 移动端项目
                handleMobile(name, cmd);
            } else if (useSystem) {
                // 管理系统项目
                handleSystem(name, cmd);
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
                        handleSystem(name, cmd);

                    } else if (projectType == 'mobile') {
                        // 移动端项目
                        handleMobile(name, cmd);
                    }
                });
            }
        })
};
