'use strict';

function Hello() {
  var greeting = [
    'this',
    'is',
    'a',
    'multiline',
    'greeting'
  ].join(' ');
  throw new Error('Hello error!');
}

module.exports = Hello;
