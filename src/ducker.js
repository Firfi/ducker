;(function() {

  "use strict";

  var root = this;

  // Object.assign polyfill https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  var assign = Object.assign || function(target, firstSource) {
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource === undefined || nextSource === null) continue;
      var keysArray = Object.keys(Object(nextSource));
      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
        var nextKey = keysArray[nextIndex];
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
      }
    }
    return to;
  };

  var ducker = function() {
    return this; // TODO call of ducker() returns another instance with prepassed params
  };

  if (typeof root.exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      root.exports = module.exports = ducker;
    }
    root.exports.ducker = ducker;
  } else {
    root.ducker = ducker;
  }

// TODO registerType()
  var defaultValidators = { // TODO what if null? handle it same as param not exist
    'string': function(o) { return typeof o === 'string'; },
    'int': function(o) { return this.number(o) && (o === parseInt(o, 10)); },
    'number': function(o) { return typeof o === 'number'; }
  };

  ducker.getValidator = function(name) {
    return defaultValidators[name];
  };

  // TODO check if all types are present
  // TODO be sure it isn't recursive
  // TODO add necessary params with 'string!' syntax
  var paramTypes = {
    'stringOption': 'string!',
    'arrayOfStringsOption': ['string'],
    'intOption': 'int',
    'objectWithIntOption': {
      'intOption': 'int' // TODO add dot syntax
    }
  };

  ducker.validate = function(opts, paramTypes, validators) {
    opts = opts || {};
    validators = assign(validators || {}, defaultValidators);
    var _validate = function(opts, paramTypes, validationsBreadcrumbs) {
      var errors = Object.keys(paramTypes).map(function(paramName) {
        var validationType = paramTypes[paramName];
        var required = validationType.slice(-1) === '!'; // param is necessary
        if (required) validationType = validationType.substr(0, validationType.length - 1); // remove '!'
        // TODO options to properties?
        var validationFun = validators[validationType]; // TODO array support! object support!
        var optValue = opts[paramName];
        if (optValue === undefined && !required) {return false;}
        var valid = validationFun(optValue);
        if (valid) return false; // falsy value because error will be 'truly'
        else {
          //var bc = validationsBreadcrumbs.join('.'); // no. what if user has array keys with .dots. Really, he can.
          //if (bc !== '') bc += '.'; // it isn't root
          return [[validationsBreadcrumbs, paramName].reduce(function(a, b) { // <> .flatten
            return a.concat(b);
          }), validationType]; // TODO and validationname, well, it coud've been object so let's fetch error right here
        }
      }).filter(function(e) {return !!e}); // TODO check if there's too many options
      // TODO option for string errors or object errors
      return errors;
    };
    return _validate(opts, paramTypes, []);
  };

  if (typeof define === 'function' && define.amd) {
    define('ducker', [], function() {
      return ducker;
    });
  }

}.call(this));



