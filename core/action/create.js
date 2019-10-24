const program = require('commander');   //用来处理命令行参数
const download = require('download-git-repo'); //用来从github下载模板
const chalk = require('chalk'); //用来给命令行提示改变颜色
const inquirer = require('inquirer');   //用来处理命令行交互
const symbols = require('log-symbols'); //用来给命令行提示信息添加小图标
const fs = require('fs');
const config = require('../../config');
const tool = require('../../tool');
const _ = require('underscore');
const { exec } = require('child_process');
const actionConfig = require('./config');
module.exports = function () {
    // 初始化项目
    program
        .command('create <name>')
        .option('-d, --default', 'Use default infomation.')
        .action((name, cmd) => {
            var useDefault = cmd.default;
            var dest = `${process.cwd()}\\${name}`;
            if (useDefault) {
                // 使用默认配置进行初始化项目,不进行询问
                tool.spinner.start(chalk.yellow.bold("正在下载模板..."));
                download(config.git.base, dest, function (err) {
                    if (err) {
                        tool.spinner.fail(chalk.red.bold("下载模板失败"));
                    } else {
                        tool.spinner.succeed(chalk.green.bold("下载模板完成"));
                    }
                });
            } else {
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
                    // 判断项目是否存在
                    if (fs.existsSync(dest)) {
                        console.log(symbols.error, chalk.red.bold('项目已存在'));
                        return;
                    }

                    tool.spinner.start(chalk.yellow.bold("正在下载模板..."));
                    download(config.git.base, dest, (err) => {
                        if (err) {
                            tool.spinner.fail(chalk.red.bold("下载模板失败"));
                            console.error(err);
                        } else {
                            tool.spinner.succeed(chalk.green.bold("下载模板完成"));
                            tool.spinner.start(chalk.yellow.bold("正在初始化项目..."));

                            // package.json替换
                            let pkg = `${process.cwd()}\\${name}\\package.json`;
                            tool.compile(pkg,{
                                name,
                                description: answers.description,
                                author: answers.author
                            });
                            // build/base替换
                            let buildBase = `${process.cwd()}\\${name}\\build\\base.js`;
                            tool.compile(buildBase,{name});

                            // main.js替换
                            let mainJs = `${process.cwd()}\\${name}\\src\\main.js`;
                            tool.compile(mainJs,{
                                ip:tool.IPv4(),
                                domain:'{{domain}}',    // 防止被替换成空字符串，这个属性在vs config时才替换
                                prod:'{{prod}}'         // 防止被替换成空字符串，这个属性在vs config时才替换
                            });
                            tool.spinner.succeed(chalk.green.bold("项目初始化完成"));
                            // 询问是否立即初始化配置
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    choices:["Yes","No"],
                                    name: 'startConfig',
                                    message: '是否立即进行项目的初始化配置？'
                                },
                            ]).then(function (answers) {
                                if(answers.startConfig == 'Yes'){
                                    // console.log(symbols.success,chalk.green.bold("配置完成！！！"));
                                    actionConfig.handleConfig({
                                        cwd:`${process.cwd()}\\${name}`
                                    });
                                }else{
                                    console.log(symbols.warning,chalk.yellow(`项目未进行配置，随后进入${chalk.red.bold('项目根目录')}使用${chalk.red.bold('vs config')}进行配置或者直接在代码文件中进行修改`));
                                }
                            })
                        }
                    })
                })
            }

        });
};