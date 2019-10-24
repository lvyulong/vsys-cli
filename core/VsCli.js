const program = require('commander');   //用来处理命令行参数




const _ = require('underscore');


const actionBase = require('./action/base');
const actionCreate = require('./action/create');
const actionConfig = require('./action/config');

const actionPage = require('./action/page');

module.exports = class VsCli {

    constructor(config){
        this.config = config;
        this.run();
    }

    run(){
        // 基础设置
        actionBase();



        // 配置项目
        actionConfig.config();

        // 创建新项目
        actionCreate();

        // actionCreate(this);
        //
        // actionPage(this);



        //
        program.parse(process.argv);
        //
        // if (!process.argv.slice(2).length || program.list) {
        //     program.outputHelp();
        // }
    }

};