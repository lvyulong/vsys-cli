#!/usr/bin/env node
const program = require('commander');   //用来处理命令行参数
const download = require('download-git-repo'); //用来从github下载模板
const inquirer = require('inquirer');   //用来处理命令行交互
const ora = require('ora'); //用来提供loading图标
const chalk = require('chalk'); //用来给命令行提示改变颜色
const symbols = require('log-symbols'); //用来给命令行提示信息添加小图标
const handlebars = require('handlebars');   //编译模板文件中可动态替换的变量，如package.json文件中的name、author等
const fs = require('fs');

const gitUrl = 'https://github.com:lvyulong/vue-demo#master';

program
    .version(require('./package.json').version)
    .parse(process.argv);

program
    .command('init <name>')
    .action((name) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'author',
                message: '请输入作者名称：'
            },
            {
                type: 'input',
                name: 'description',
                message: '请输入描述：'
            }
        ]).then((answers) => {
            // 判断项目是否存在
            if (fs.existsSync(name)){
                console.log(symbols.error, chalk.red('项目已存在'));
                return;
            }

            let spinner = ora('正在下载模板...');
            spinner.start();
            // 第二个参数指定模板下载过来之后放到什么地方
            download(gitUrl, name, {clone: true}, (err) => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err));
                } else {
                    spinner.succeed();
                    let meta = {
                        name,
                        description: answers.description,
                        author: answers.author
                    };
                    let packageFileName = `${name}/package.json`;
                    if (fs.existsSync(packageFileName)){
                        let content = fs.readFileSync(packageFileName).toString();
                        let result = handlebars.compile(content)(meta);
                        fs.writeFileSync(packageFileName, result);
                    }
                    console.log(symbols.success, chalk.green('项目初始化完成'));
                }
            })
        })
    });

program.parse(process.argv);


