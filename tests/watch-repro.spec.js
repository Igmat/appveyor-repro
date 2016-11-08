'use strict';

var fs = require('fs');
var path = require('path');
var spawn = (process.platform === 'win32')
    ? require('cross-spawn-with-kill')
    : require('cross-spawn');

var JEST_PATH = 'jest';

function runJestInWatchMode(dir, args) {
    var isRelative = dir[0] !== '/';

    if (isRelative) {
        dir = path.resolve(__dirname, dir);
    }

    args = (args !== undefined) ? args : [];
    args.push('--watchAll');

    var childProcess = spawn(JEST_PATH, args, {
        cwd: dir,
    });
    childProcess.stderr.on('data', function (data) {
        console.log(data.toString());
    });
    var getStderrAsync = function () {
        return new Promise(function (resolve) {
            var stderr = '';
            var listener = function (data) {
                stderr += data.toString();
                if (data.toString().includes('Ran all')) {
                    resolve(stderr);
                    childProcess.stderr.removeListener('data', listener);
                }
            };
            childProcess.stderr.on('data', listener);
        });
    };
    return { childProcess, getStderrAsync };
}

var helloFile = fs.readFileSync(path.resolve(__dirname, './watch-test/Hello.js'), 'utf8');
var helloFileUpdate = [
    '\'use strict\';',
    '',
    'function Hello() {',
    '  var greeting = [',
    '      \'this is a\',',
    '      \'multiline\',',
    '      \'greeting\'',
    '  ].join(\' \');',
    '  throw new Error(\'Hello error!\');',
    '}',
    '',
    'module.exports = Hello;'
].join('\r');
var testFile = fs.readFileSync(path.resolve(__dirname, './watch-test/__tests__/Hello.test.js'), 'utf8');
var testFileUpdate = [
    'var Hello = require(\'../Hello\');',
    '',
    'describe(\'Hello Class\', function() {',
    '',
    '  it(\'should throw an error on line 11\', function() {',
    '',
    '',
    '',
    '    var hello = new Hello();',
    '',
    '  });',
    '',
    '});'
].join('\r');

describe('watch-repro', function () {
    var result;
    var DEFAULT_TIMEOUT_INTERVAL;

    beforeAll(function () {
        result = runJestInWatchMode('./watch-test');
        DEFAULT_TIMEOUT_INTERVAL = jasmine['DEFAULT_TIMEOUT_INTERVAL'];
        jasmine['DEFAULT_TIMEOUT_INTERVAL'] = 10000;
    });

    it('should show the correct error locations without changes', function () {
        return result.getStderrAsync().then(function (stderr) {
            expect(stderr).toContain('Hello.js:11:9');
            expect(stderr).toContain('Hello.test.js:7:17');
        });
    });

    it('should show the correct error locations with changes in source file', function () {
        var promise = result.getStderrAsync().then(function (stderr) {
            expect(stderr).toContain('Hello.js:9:9');
            expect(stderr).toContain('Hello.test.js:7:17');
        });
        fs.writeFileSync(path.resolve(__dirname, './watch-test/Hello.js'), helloFileUpdate);
        return promise;
    });

    it('should show the correct error locations with changes in source file and test file', function () {
        var promise = result.getStderrAsync().then(function (stderr) {
            expect(stderr).toContain('Hello.js:9:9');
            expect(stderr).toContain('Hello.test.js:9:17');
        });
        fs.writeFileSync(path.resolve(__dirname, './watch-test/__tests__/Hello.test.js'), testFileUpdate);
        return promise;
    });

    afterAll(function () {
        result.childProcess.kill();
        // revert changes back
        jasmine['DEFAULT_TIMEOUT_INTERVAL'] = DEFAULT_TIMEOUT_INTERVAL;
        fs.writeFileSync(path.resolve(__dirname, './watch-test/Hello.js'), helloFile);
        fs.writeFileSync(path.resolve(__dirname, './watch-test/__tests__/Hello.test.js'), testFile);
    });
});