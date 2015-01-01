var params = {
  'firstStringParam': 'someString',
  'secondIntParamThatIsRequired': 42,
  'someThirdParamThatWeDontWantValidate': 'anything',
  'someCustomParam': 'customString'
};

function myFunction(params) {
  var paramTypes = {
    'firstStringParam': 'string', // built-in 'string' validator
    'secondIntParamThatIsRequired': 'int', // built-in 'int' validator
    // and we don't care about 'someThirdParamThatWeDontWantValidate' param
    'someCustomParam': 'customStringValidator' // 'customStringValidator' is a validator that we define on call or register in ducker with registerValidator(name, validator) function
  };
  var customValidators = {
    'customStringValidator': function(s) { return s === 'customString'; }
  };
  var errors = ducker.validate(params, paramTypes, customValidators);
  console.warn('errors number: ' + errors.length);
  console.warn(JSON.stringify(errors));
}

myFunction(params);

params.someCustomParam = 'nonValidString';

myFunction(params);

