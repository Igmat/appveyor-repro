'use strict';

var path = require('path');
var spawn = (process.platform === 'win32')
  ? require('cross-spawn-with-kill')
  : require('cross-spawn');

var infinite_process = './src/infinite-process.js';

function runInfiniteProcess() {
    var childProcess = spawn('node', [infinite_process]);
    childProcess.stderr.on('data', function(data) {
        console.log(data.toString());
    });
    var getStderrAsync = function() {
        return new Promise(function(resolve) {
            let stderr = '';
            let listener = function(data) {
                stderr += data.toString();
                if (data.toString().includes('error #')) {
                    resolve(stderr);
                    childProcess.stderr.removeListener('data', listener);
                }
            };
            childProcess.stderr.on('data', listener);
        });
    };

    return { childProcess, getStderrAsync };
}

describe('repro', function() {
    var result;

    beforeAll(function() {
        result = runInfiniteProcess();
    });

    it('should contain error #1', function() {
        return result.getStderrAsync().then(function(stderr) {
            expect(stderr).toContain('error #1');
            expect(stderr).toContain('more errors');
        });
    });

    it('should contain error #2', function() {
        return result.getStderrAsync().then(function(stderr) {
            expect(stderr).toContain('error #2');
            expect(stderr).toContain('more errors');
        });
    });

    it('should contain error #3', function() {
        return result.getStderrAsync().then(function(stderr) {
            expect(stderr).toContain('error #3');
            expect(stderr).toContain('more errors');
        });
    });

    afterAll(function() {
        result.childProcess.kill();
    });
});