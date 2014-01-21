var u = require('./');
var assert = require('assert');

assert.deepEqual(
    u.callFresh(function(q) { return u.eq(5, q); })(u.emptyState()),
    [ [ { '0': 5 }, 1 ] ]
  );

var abGoal = function() {
  return u.conj(
    u.callFresh(function(a) { return u.eq(a, 7); }),
    u.callFresh(function(b) { return u.disj(u.eq(b, 5), u.eq(b, 6)); })
  );
};

assert.deepEqual(
  abGoal()(u.emptyState()),
  [ [ { '0': 7, '1': 5 }, 2 ], [ { '0': 7, '1': 6 }, 2 ] ]);

