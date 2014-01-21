# µkanren.js

This is an implementation of [µKanren](http://webyrd.net/scheme-2013/papers/HemannMuKanren2013.pdf) in JavaScript.

TODO: infinite streams

## example

```
var u = require('./');
var assert = require('assert');

assert.deepEqual(
    u.callFresh(function(q) { return u.eq(5, q); })(u.emptyState()),
    [ [ { '0': 5 }, 1 ] ]
  );
```

Cheers, [zii](https://twitter.com/zii)
