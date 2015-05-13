'use strict';

var render = require('./render'),
    quotes = require('./quotes'),
    cache = require('./cache');

exports.paths = [{
    path: /^\/static/,
    renderer: render.serveStatic
}, {
    path: /^\/templates/,
    renderer: render.serveStatic
}, {
    path: /^\/(index[.](html?|json|yml))?$/i,
    renderer: render.renderIndex
}, {
    path: /^\/scripts[.]js$/,
    renderer: render.renderScripts
}, {
    path: /^\/styles[.]css$/,
    renderer: render.renderStyles
}, {
    path: /^\/avatar\//,
    renderer: quotes.serveAvatar
}
];

if (process.env.SOCKDEV) {
    exports.paths = exports.paths.concat([{
        path: /^\/reset([.]html)?$/i,
        renderer: function (uri, request, response) {
            cache.buildCache(function () {
                render.renderIndex(uri, request, response);
            });
        }
    }]);
}
