'use strict';

process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

var jest = require('jest');
var fs = require('fs');

var argv = process.argv.slice(2);
argv.push('--no-cache');
// Watch unless on CI
if (!process.env.CI) {
  //argv.push('--watch');
}

jest.run(argv);
