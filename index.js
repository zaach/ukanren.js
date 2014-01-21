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

module.exports = {
  eq: eq,
  callFresh: callFresh,
  conj: conj,
  disj: disj,
  emptyState: emptyState
};
