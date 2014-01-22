// Implementation
// ------------------

function emptyState() {
  return [Object.create(null), 0];
}

function LVar(index) {
  this.index = index;
}
LVar.prototype.isLVar = true;

function lvar(i) {
  return new LVar(i);
}
function lvarToIndex(lvar) {
  return lvar.index;
}
function isLVar(term) {
  return !!term.isLVar;
}
function eqLVar(u, v) {
  return u.index === v.index;
}

function extendSubs(lvar, term, subs) {
  var newSubs = JSON.parse(JSON.stringify(subs));
  newSubs[lvarToIndex(lvar)] = term;
  return newSubs;
}

function mzero() {
  return [];
}

function walk(term, subs) {
  var pr = isLVar(term) && subs[lvarToIndex(term)];
  return pr ? walk(pr, subs) : term;
}

// aka ≡
function eq(u, v) {
  return function goal(state) {
    var subs = unify(u, v, state[0]);
    return subs ? unit([subs, state[1]]) : mzero();
  };
}

function unit(state) {
  return [state];
}

function unify(u, v, s) {
  u = walk(u, s);
  v = walk(v, s);
  return (
    isLVar(u) && isLVar(v) && eqLVar(u, v) ? s :
    isLVar(u) ? extendSubs(u, v, s) :
    isLVar(v) ? extendSubs(v, u, s) :
    isArray(u) && isArray(v) ? unifyArray(u, v, s) :
    isObject(u) && isObject(v) ? unifyObject(u, v, s) :
    equiv(u, v) ? s :
    false
  );
}

// equivalence of primitive JS values
function equiv(a, b) {
  return a === b;
}

function callFresh(fn) {
  return function goal(state) {
    var count = state[1];
    return fn(lvar(count))([state[0], state[1] + 1]);
  };
}

function disj(goal1, goal2) {
  return function goal(state) {
    return mplus(goal1(state), goal2(state));
  };
}

function conj(goal1, goal2) {
  return function goal(state) {
    return bind(goal1(state), goal2);
  };
}

// naive mplus that doesn't handle infinite streams
function mplus(stream1, stream2) {
  return stream1.concat(stream2);
}

function bind(stream, goal) {
  return !stream.length ? mzero() :
          mplus(goal(stream[0]), bind(stream.slice(1), goal));
}

// Utilities
// ------------------
function isArray(val) {
  return Array.isArray(val);
}

function unifyArray(u, v, s) {
  return u.reduce(function(subs, val, i) {
    return subs && unify(val, v[i], subs);
  }, s);
}

function isObject(val) {
  return val !== null && typeof val === 'object';
}

function unifyObject(u, v, s) {
  return Object.keys(u).reduce(function(subs, key) {
    return subs && unify(u[key], v[key], subs);
  }, s);
}

// Extra goal constructors
// -----------------------

function fail() {
  return function goal() { return mzero(); };
}

function succeed() {
  return function goal(state) { return unit(state); };
}

// turns an array of goals into their conjunction
function and(list) {
  if (list.length === 1) return list[0];

  return list.reduce(function(prev, val) {
    return conj(prev, val);
  });
}

function conde() {
  var args = [].slice.call(arguments, 0);
  if (args.length === 1) return and(args[0]);

  return args.reduce(function(prev, val, i) {
    return disj(
      i > 1 ? prev : and(prev),
      and(val)
    );
  });
}

function membero(x, list) {
  if (list.length === 1) return eq(x, list[0]);

  return list.reduce(function(prev, val, i) {
    return disj(
      i > 1 ? prev : eq(x, prev),
      eq(x, val)
    );
  });
}

module.exports = {
  eq: eq,
  callFresh: callFresh,
  conj: conj,
  disj: disj,
  emptyState: emptyState,

  conde: conde,
  membero: membero,
  succeed: succeed,
  fail: fail
};
