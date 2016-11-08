'use strict';

setTimeout(function() {
    console.error('error #1');
}, 1000);
setTimeout(function() {
    console.error('error #2');
}, 2000);
setTimeout(function() {
    console.error('error #3');
}, 3000);
setInterval(function() {
    console.error('more errors');
}, 500);
// infinite loop
process.stdin.resume();