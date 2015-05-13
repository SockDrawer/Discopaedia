'use strict';
var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    jsmin = require('jsmin').jsmin,
    cssmin = require('cssmin');


function readall(dir, filter, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            callback(err);
        }
        var tpl = files.filter(function (file) {
            return filter.test(file);
        });
        async.map(tpl.map(function (file) {
            return path.join(dir, file);
        }), function (file, next) {
            fs.readFile(file, 'binary', next);
        }, function (errs, data) {
            if (errs) {
                return callback(errs);
            }
            callback(null, tpl.map(function (name, idx) {
                return {
                    name: name,
                    data: data[idx]
                };
            }));
        });

    });

}

function readTemplates(callback) {
    var suffix = /[.]html?$/;
    readall('templates', suffix, function (err, files) {
        if (err) {
            return callback(err);
        }
        var templates = {};
        files.forEach(function (file) {
            templates[file.name.replace(suffix, '')] = file.data;
        });
        callback(null, templates);
    });
}

function readScripts(callback) {
    readall('static/scripts', /[.]js/, function (err, files) {
        if (err) {
            return callback(err);
        }
        files.forEach(function (file) {
            if (/[.]min[.]js$/.test(file.name)) {
                return;
            }
            try {
                file.data = jsmin(file.data);
            } catch (e) {
                /*eslint-disable no-console */
                console.warn('Error minifying ' + file.name + ': ' + e);
                /*eslint-enable no-console */
            }
        });
        callback(null, files);
    });
}

function readStyles(callback) {
    readall('static/styles', /[.]css/, function (err, files) {
        if (err) {
            return callback(err);
        }
        files.forEach(function (file) {
            if (/[.]min[.]css$/.test(file.name)) {
                return;
            }
            try {
                file.data = cssmin(file.data);
            } catch (e) {
                /*eslint-disable no-console */
                console.warn('Error minifying ' + file.name + ': ' + e);
                /*eslint-enable no-console */
            }
        });
        callback(null, files);
    });
}

exports.buildCache = function buildCache(callback) {
    async.parallel({
        templates: readTemplates,
        scripts: readScripts,
        styles: readStyles
    }, function (err, results) {
        if (err) {
            return callback(err);
        }
        exports.templates = results.templates;
        exports.scripts = results.scripts;
        exports.styles = results.styles;
        callback();
    });
};

exports.templates = {};
exports.scripts = {};
exports.styles = {};