#!/usr/bin/env node
// 处理命令行
const program = require('commander');
const package = require('./package');
const core = require('./core');


// 版本号命令
program.version(package.version, '-v, --version');

// 创建新项目
core.create();

// 配置项目
core.config.config();

// 创建页面
core.page();

// 格式化命令行参数
program.parse(process.argv);
