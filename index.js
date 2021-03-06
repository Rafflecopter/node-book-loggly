// node-book-loggly/index.js
// the loggly middleware for the node book logging framework

// builtin
var http = require('http');

// vendor
var extend = require('xtend')

// level is a numeric value for book from [0, 5]
// panic, error, warning, info, debug, trace
var levels = ['panic', 'error', 'warning', 'info', 'debug', 'trace'];

module.exports = function(logglyClient, options) {
    options = options || {};
    var ignore_levels = options.ignore_levels || 4;

    if (!logglyClient.json) {
        throw new Error('JSON must be enabled on the loggly client!')
    }

    return logglyMiddleware;

    function logglyMiddleware () {
        var self = this;

        // default is error
        var lvl = 'error';

        if (self.level < levels.length) {
            lvl = levels[self.level];
        }

        // ignore anything below warning
        if (self.level > ignore_levels) {
            return;
        }

        var extra = extend({}, self);
        delete extra.level;
        delete extra.message;

        // add our fields to the message
        var packet = extend({
            isError: false,
            message: self.message,
            extra: extra,
            level_code: self.level,
            level: lvl
        }, options.from);

        for (var idx=0 ; idx < arguments.length ; ++idx) {
            var arg = arguments[idx];

            // http interface handling
            if (arg instanceof http.IncomingMessage) {
                packet[interfaces.http.key] = interfaces.http(arg);
            }
            // error will be handled below
            // only allowed as first argument
            else if (arg instanceof Error) {
                continue;
            }
            // if user passed an object, then capture extra fields
            else if (arg instanceof Object) {
                Object.keys(arg).forEach(function(key) {
                    extra[key] = arg[key];
                });
            }
        }

        // if the first argument is an error, capture it as the error interface
        if (arguments[0] instanceof Error) {
            var err = arguments[0];

            if (Object.keys(err).length > 0) {
                extra.error = err;
            }

            packet.isError = true;
        }

        
        logglyClient.log(packet, function (err) {
            // Use uncaughtException to catch these errors
            if (err) {
                throw err
            }
        });
    }
}

var noop = function() {};
