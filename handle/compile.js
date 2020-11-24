const fs = require('fs');
//编译模板文件中可动态替换的变量，如package.json文件中的name、author等
const handlebars = require('handlebars');
const chalk = require('chalk');
module.exports = function (dest,meta) {
    console.log(meta);
    if (fs.existsSync(dest)) {
        let content = fs.readFileSync(dest).toString();
        let result = handlebars.compile(content)(meta);
        fs.writeFileSync(dest, result);
    }else{
        throw new Error(chalk.red(`${dest}文件不存在，请检查该命令是否在正确的目录执行`));
    }
};