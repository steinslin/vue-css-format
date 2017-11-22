'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var postcss = require('postcss');
var scss = require('postcss-scss');
var less = require('postcss-less');
var stylefmt = require('stylefmt');
var path = require('path');

var files = [];

function isVue(str) {
  return (/\.vue$/.test(str)
  );
}

function isScss(str) {
  return (/\.s?(a|c)ss$/.test(str)
  );
}

function isLess(str) {
  return (/\.less/.test(str)
  );
}

function readDir(dir) {
  return new _promise2.default(function (resolve, reject) {
    fs.readdir(dir, function (err, list) {
      err ? reject(err) : resolve(list);
    });
  });
}

function fsStat(dir) {
  return new _promise2.default(function (resolve, reject) {
    fs.stat(dir, function (err, stats) {
      err ? reject(err) : resolve(stats);
    });
  });
}

function walk(dir) {
  return readDir(dir).then(function (list) {
    return _promise2.default.all(list.map(function (pathname) {
      return fsStat(path.resolve(dir, pathname)).then(function (stats) {
        if (stats.isFile()) {
          if (isVue(pathname)) {
            files.push({
              path: path.resolve(dir, pathname),
              syntax: 'vue'
            });
          } else if (isScss(pathname)) {
            files.push({
              path: path.resolve(dir, pathname),
              syntax: scss
            });
          } else if (isLess(pathname)) {
            files.push({
              path: path.resolve(dir, pathname),
              syntax: less
            });
          }
        } else {
          if (pathname !== 'node_modules') {
            return walk(path.resolve(dir, pathname));
          }
        }
      }).catch(console.error);
    }));
  }).catch(console.error);
}

function readFile(dir) {
  return new _promise2.default(function (resolve, reject) {
    fs.readFile(dir, 'utf-8', function (err, data) {
      err ? reject(err) : resolve(data);
    });
  });
}

function formatVueStyle(dir) {
  readFile(dir).then(function (data) {
    var vueStyleReg = /(<style[\s\S]*?>)([\s\S]*?)(<\/style>)/;
    if (vueStyleReg.test(data)) {
      var startTag = RegExp.$1;
      var endTag = RegExp.$3;
      var style = RegExp.$2.replace(/^\n+|\n+$/g, '');
      var match = startTag.match(/\slang=['"](.*?)['"]/);
      var syntaxText = void 0;
      var syntax = void 0;
      if (match) {
        syntaxText = match[1];
      }
      if (syntaxText === 'less') {
        syntax = less;
      } else {
        syntax = scss;
      }
      format(style, syntax).then(function (result) {
        writeFile(dir, data.replace(vueStyleReg, startTag + '\n' + result.css + '\n' + endTag));
      }).catch(function (err) {
        console.error('format error! in file: ' + dir);
      });
    }
  }).catch(function (err) {
    console.error('readFile error: ' + err + dir);
  });
}

function format(data, syntax) {
  return new _promise2.default(function (resolve, reject) {
    postcss([stylefmt]).process(data, {
      syntax: syntax
    }).then(resolve).catch(reject);
  });
}

function writeFile(dir, data) {
  fs.writeFile(dir, data, function (err) {
    if (err) {
      console.error('writeFile error in file: ' + dir);
    } else {
      console.log(dir + ' ------- format done');
    }
  });
}

function formatStyle(dir, syntax) {
  readFile(dir).then(function (style) {
    format(style, syntax).then(function (result) {
      writeFile(dir, result.css);
    });
  }).catch(function (err) {
    console.error('readFile error: ' + dir);
  });
}

function formatter(_path) {
  walk(_path).then(function () {
    files.forEach(function (_ref) {
      var path = _ref.path,
          syntax = _ref.syntax;

      if (syntax === 'vue') {
        formatVueStyle(path);
      } else {
        formatStyle(path, syntax);
      }
    });
  });
}

module.exports = formatter;
