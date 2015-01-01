Ducker is a library created for purpose of function parameters object validation.

`bower install ducker --save`

`<script src="bower_components/ducker/dist/ducker.min.js"></script>`

You have a `function(params)` where params is an object that you would like to validate.

On validation it returns array of errors (no exceptions or nulls, these're for pussies) which is empty if everything is ok.

Errors consists paths to invalid param and the name of validator so you can handle it as you like and have pretty error message, or ugly if that's yur choice.

Assume you want it to contain some set of params which some of which are required and some of which are supposed to have some type:

```javascript
    var params = {
        'firstStringParam': 'someString',
        'secondIntParamThatIsRequired': 42,
        'someThirdParamThatWeDontWantValidate': 'anything',
        'someCustomParam': 'customString'
    }
```

Inside function you describe types of params:

```javascript
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
    }
```

It currently uses some non-compatible with old browsers functions to IE >= 9. Your soul shall suffer.