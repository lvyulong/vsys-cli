const program = require('commander');   //用来处理命令行参数
const inquirer = require('inquirer');   //用来处理命令行交互
const tool = require('../../tool');
const fs = require('fs');
module.exports = function () {
    // 初始化页面
    program
        .command("page")
        .action(() => {
            console.log("请选择以下模板进行初始化页面：");
            for (let i = 0; i < pageList.length; i++) {
                let item = pageList[i];
                console.log(chalk.blue(`${item.id}.`), chalk.blue(item.label));
            }
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'templateId',
                    message: '请输入模板编号：'
                },
                {
                    type: 'input',
                    name: 'path',
                    message: '请指定初始化路径：'
                },
                {
                    type: 'input',
                    name: 'filename',
                    message: '请指定文件名称：'
                }
            ]).then((answers) => {
                tool.createPath(answers.path, function (res) {
                    let srcFile = _.findWhere(pageList, {id: parseInt(answers.templateId)}).name;
                    let desFile = answers.filename;
                    let desPath = answers.path;
                    fs.copyFile(`./templates/${srcFile}.vue`, `./${res}/${desFile}.vue`, (err) => {
                        if (err) {
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            console.log(symbols.success, chalk.green("页面初始化完成！"));
                        }
                    });
                });
            })
        });
};