'use strict';

var render = require('./render'),
    quotes = require('./quotes'),
    cache = require('./cache');

/**
 * Routed paths. Paths are dictionaries containing a test regex and a
 * renderer function.
 *
 * It's expected that exactly one regex will match a given path. Undefined
 * behavior results if this assumption is violated.
 *
 * the render function is provided with 3 parameters:
 * * uri (string): the URI provided by the client (path only)
 * * request (Incomming Message): instance of:
 *       https://nodejs.org/api/http.html#http_http_incomingmessage
 * * response (Server Response): instance of
 *       https://nodejs.org/api/http.html#http_class_http_serverresponse
 *
 * the render function is expected to handle all aspects of the server
 * response itself.
 */
exports.paths = [{
    path: /^\/static/,
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
}];

/**
 * Additional paths available in dev mode.
 *
 * Dev mode is entered by setting the `SOCKDEV` environment variable to a
 * truthy value
 */

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
