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

  ducker.registerValidator = function(name, fun) {
    if (_validators[name]) console.warn('validator ' + name + ' already exist, overwriting');
    _validators[name] = fun;
  };

  if (typeof root.exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      root.exports = module.exports = ducker;
    }
    root.exports.ducker = ducker;
  } else {
    root.ducker = ducker;
  }

  var defaultValidators = { // TODO what if null? handle it same as param not exist
    'string': function(o) { return typeof o === 'string'; },
    'int': function(o) { return defaultValidators.number(o) && (o === parseInt(o, 10)); },
    'number': function(o) { return typeof o === 'number'; }
  };

  var _validators = assign({}, defaultValidators);

  ducker.getValidator = function(name) {
    return _validators[name];
  };

  // TODO check if all types are present
  // TODO be sure it isn't recursive
  // TODO add necessary params with 'string!' syntax
  var paramTypes = {
    'stringOption': 'string!',
    'arrayOfStringsOption': ['string'],
    'intOption': 'int',
    'objectWithIntOption': {
      'intOption': 'int!' // TODO add dot syntax
    }
  };

  // utils
  var toObject = function(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
      rv[i] = arr[i];
    return rv;
  };
  var isObject = function(o) {
    return o !== null && typeof o === 'object';
  };
  var paramIsRequired = function(param) {
    return (typeof param === 'string' && param.slice(-1) === '!') || !!param[DUCKER_REQUIRED_PARAM];
  };
  // flatten util stolen from underscore https://github.com/jashkenas/underscore/blob/master/underscore.js
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0, value;
    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
      value = input[i];
      if (value && value.length >= 0 && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  var DUCKER_REQUIRED_PARAM = '__ducker__required';

  // this is the function that propagates special required! property to parents if children have it. it works only for objects ignoring arrays
  // because it's unclear for arrays which is required!, array itself or array members (and how much of them is required)
  // mutates the input
  var prehandledRequired = function(paramTypes) {
    var _prehandledRequired = function(pt, parents) { // parents are links on different nodes of res
      Object.keys(pt).map(function(k) {
        var child = pt[k];
        if (isObject(child)) {
          _prehandledRequired(child, parents.concat([pt]))
        } else {
          if (paramIsRequired(child)) {
            pt[DUCKER_REQUIRED_PARAM] = true;
            parents.forEach(function(parent) {
              parent[DUCKER_REQUIRED_PARAM] = true;
            });
          }
        }
      });
    };
    _prehandledRequired(paramTypes, []);
  };

  ducker.validate = function(opts, paramTypes, validators) {
    paramTypes = JSON.parse(JSON.stringify(paramTypes)); // we mutate it later.

    opts = opts || {};
    validators = assign(_validators, validators || {}); // add passed validators and mixin existing validations with passed validators priority
    var _validate = function(opts, paramTypes, validationsBreadcrumbs) {
      var errors = Object.keys(paramTypes).map(function(paramName) {
        if (paramName === DUCKER_REQUIRED_PARAM) { return false; }
        var _validationType = paramTypes[paramName]; // have original validationType as we'll need it in error function but will use another validationType form later without '!' for required params
        var _mkError = function() {
          // TODO option for string errors or object errors
          return {path: validationsBreadcrumbs.concat([paramName]), validation: _validationType};
        };
        var validateArray = Array.isArray(_validationType); // harvest sugar for array
        //if (validateArray) validationType = validationType[0];
        var required = paramIsRequired(_validationType);
        var validationType = ( required && typeof _validationType === 'string' ) ?
          _validationType.substr(0, _validationType.length - 1) : _validationType; // remove '!'
        var optValue = opts[paramName];
        if (optValue === undefined && !required) {return false;}
        if (validateArray) { // let's convert it to object and then handle as an object
          // it should be array at least
          if (!Array.isArray(optValue)) return _mkError();
          optValue = toObject(optValue);
          // TODO defaultValue() optimisation
          // here we transform ['string'] to {0: 'string', 1: 'string', ...} to recursive call later
          var validationTypeOld = validationType;
          validationType = assign({}, optValue);
          Object.keys(validationType).forEach(function(i) {
            validationType[i] = validationTypeOld[0];
          });
        }
        if (isObject(validationType)) { // we should go recursively
          if (!isObject(optValue)) { // but we can't and we're in dead end
            return _mkError();
          } else {
            return _validate(optValue, validationType, validationsBreadcrumbs.concat([paramName]));
          }
        } else {
          // we're at root at last
          var validationFun = validators[validationType];

          var valid = validationFun(optValue);
          if (valid) return false;
          else return _mkError();
        }
      });
      // on this stage we have array of [possible another arrays recursively] errors, so flatten it and then filter for 'valid' === falsy values
      return flatten(errors).filter(function(e) {return !!e}); // TODO check if there's too many options
    };
    // prehandle param types adding required! to parents that have required! children
    prehandledRequired(paramTypes);
    return _validate(opts, paramTypes, []);
  };

  if (typeof define === 'function' && define.amd) {
    define('ducker', [], function() {
      return ducker;
    });
  }

}.call(this));



