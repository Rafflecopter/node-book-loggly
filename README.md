# book-loggly

[loggly](http://loggly.com) middleware for the [book](https://github.com/defunctzombie/node-book) logging framework.

This middleware is shamelessly copy/modified from [book-raven](https://github.com/defunctzombie/node-book-raven).

## Install

```
npm install book book-loggly --save
```

## Use

```javascript
var log = require('book').default();

var logglyConfig = {
  "token": "your-really-long-token-you-got-when-you-created-an-http-input",
  "subdomain": "your-subdomain",
  "auth": {
    "username": "your-username",
    "password": "your-password"
  },
  // A custom book-loggly option to ignore logs at ignore_levels and above
  // 0: panic, 1: error, 2: warning, 3: info, 4: debug (default), 5: trace
  "ignore_levels": log.TRACE
};

log.use(require('book-loggly')(logglyConfig));


// Now just log as usual
log.warn("Hey there!")
log.info("Logging this object", {some: 'object'})
log.error(new Error("test error!"))
```

## Internals

`book-loggly` uses the loggly JSON capability to log objects. The general form of these objects is:

```json
{
  "isError": false,
  "message": "message",
  "level_code": 3,
  "level": "warning",
  "extra": {
    "extra_parameters": "that were added by other middleware",
    "object fields": "from objects passed into the log function"
  }
}
```

## uncaughtException

If there is an error sending the packet to loggly, an error will be thrown. To catch it, use `uncaughtException`. You can do anything here, but perhaps you want to exit.

```javascript
process.on('uncaughtException', function(err) {
    log.panic(err);
    setTimeout(process.exit.bind(process, 1), 1500);
})
```

## License

See LICENSE file.
