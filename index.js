#!/usr/bin/env node
const config = require('./config');
const VsCli = require('./core/VsCli');
const vs = new VsCli(config);
