/*jslint node: true, indent: 4 */
'use strict';
/**
 * Main entry point to SockSite. Server starts here.
 * @module server
 * @author Accalia
 * @license MIT
 */


// Make sure we get a stack trace on uncaught exception. 
// we're not supposed to get those but just in case
process.on('uncaughtException', function (err) {
    /*eslint-disable no-process-exit, no-console*/
    console.error(err.stack);
    process.exit(1);
    /*eslint-enable no-process-exit, no-console*/
});

var http = require('http'),
    url = require('url');
var cache = require('./cache'),
    render = require('./render'),
    router = require('./router');
var port = parseInt(process.env.PORT || 8888, 10),
    ip = process.env.IP || undefined,
    server = http.createServer(handler);

/**
 * Handler for HTTP requests. All HTTP requests start here
 */
function handler(request, response) {
    var uri = url.parse(request.url).pathname;

    // Log request
    /* eslint-disable no-console */
    console.log(uri);
    /* eslint-enable no-console */
    
    // Check the paths known to router to render response.
    // Response is handled by the renderer. we only care about is it handled
    var rendered = router.paths.some(function (point) {
        var res = point.path.test(uri);
        if (res) {
            point.renderer(uri, request, response);
        }
        return res;
    });
    // Render 404 if no route found
    if (!rendered) {
        render.render404Error(response);
    }
    return;

}

// Kick off the initial cache build.
// Start the HTTP server in the callback to this so initial cache is 
// loaded first
cache.buildCache(function (err) {
    /*eslint-disable no-console */
    if (err) {
        return console.error(err);
    }
    console.log('server started');
    server.listen(port, ip);
    /*eslint-neable no-console */
});
