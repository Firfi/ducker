var ducker = {};

// TODO registerType()
var types = {
  'string': function(o) { return o instanceof String },
  'int': function(o) { return this.number(o) && (o === parseInt(o, 10)) },
  'number': function(o) { return o instanceof Number }
};

// TODO check if all types are present
// TODO be sure it isn't recursive
var validations = {
  'stringOption': 'string',
  'arrayOfStringsOption': ['string'],
  'intOption': 'int',
  'objectWithIntOption': {
    'intOption': 'int' // TODO add dot syntax
  }
};

ducker.validate = function(opts, validator) {
  var _validate = function(opts, validations, validationsBreadcrumbs) {
    var errors = _.map(validations, function(validationName, optionName) {
      var validationType = validations[optionName]; // TODO options to properties?
      var validationFun = types[validationType]; // TODO array support! object support!
      var optValue = opts[optionName];
      var valid = validationFun(optValue);
      if (valid) return false; // falsy value because error will be 'truly'
      else {
        //var bc = validationsBreadcrumbs.join('.'); // no. what if user has array keys with .dots. Really, he can.
        //if (bc !== '') bc += '.'; // it isn't root
        return [_.flatten([validationsBreadcrumbs, optionName]), validationName]; // TODO and validationname, well, it coud've been object so let's fetch error right here
      }
    }).filter(function(e) {return !e}); // TODO check if there's too many options
    // TODO option for string errors or object errors
    return errors;
  };
  _validate(opts, validator.validations, [])
};

