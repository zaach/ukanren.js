var test = require('tap').test;
var u = require('../');


test('examples from the paper', function(t) {

  var goal1 = u.callFresh(function(q) { return u.eq(5, q); })(u.emptyState());

  t.equivalent(goal1, [[{ '0': 5 }, 1 ]]);

  var goal2 = u.conj(
    u.callFresh(function(a) { return u.eq(a, 7); }),
    u.callFresh(function(b) { return u.disj(u.eq(b, 5), u.eq(b, 6)); })
  )(u.emptyState());

  t.equivalent(goal2, [[{ '0': 7, '1': 5 }, 2 ], [{ '0': 7, '1': 6 }, 2 ]]);

  t.end();
});

test('arrays', function(t) {

  var goal1 = u.callFresh(function(q) { return u.eq([ 1, 2, 3 ], q); })(u.emptyState());

  t.equivalent(goal1, [[{ '0': [ 1, 2, 3 ]}, 1 ]],
    'unification works with an array value');

  var goal2 = u.callFresh(function(q) { return u.eq([ 1, q, 3 ], [ 1, 2, 3 ]); })(u.emptyState());

  t.equivalent(goal2, [[{ '0':  2 }, 1 ]],
    'unification works with an lvar nested in array');

  var goal3 = u.callFresh(function(a) {
    return u.callFresh(function(b) {
      return u.conj(
        u.eq(a, [ 1, 2, 3 ]),
        u.eq(a, [ 1, b, 3 ])
      );
    });
  })(u.emptyState());

  t.equivalent(goal3, [[{ '0': [ 1, 2, 3 ], '1': 2 }, 2 ]],
    'unification using two lvars');

  t.end();
});

test('objects', function(t) {

  var goal1 = u.callFresh(function(q) { return u.eq({ foo: 1, bar: 2 }, q); })(u.emptyState());

  t.equivalent(goal1, [[{ '0': { foo: 1, bar: 2 }}, 1 ]],
    'unification works with an object value');

  var goal2 = u.callFresh(function(q) { return u.eq({ foo: q, bar: 2 }, { foo: 9, bar: 2 }); })(u.emptyState());

  t.equivalent(goal2, [[{ '0': 9 }, 1 ]],
    'unification works with lvar nested in an object');

  t.end();
});
