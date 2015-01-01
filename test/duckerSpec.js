describe('ducker', function() {

  describe('having one string param to validate', function() {

    var paramTypes = {
      'someStringParam': 'string'
    };

    it('returns empty array if param is provided', function() {
      expect(
        ducker.validate({'someStringParam': 'someString'}, paramTypes).length
      ).toBe(0);
    });

    it('returns array with one item if param is provided but have wrong type', function() {
      expect(
        ducker.validate({'someStringParam': 42}, paramTypes).length
      ).toBe(1);
    });

    it('returns an array of arrays of {path: ..., ...} for error and path here have a one breadcrumb for one-level wrong property', function() {
      var path = ducker.validate({'someStringParam': 42}, paramTypes)[0].path;
      expect(path.length).toBe(1);
      expect(path[0]).toBe('someStringParam')
    });

    it('by default, returns empty array if param is not provided', function() {
      expect(
        ducker.validate({}, paramTypes).length
      ).toBe(0);
    });

    it('by default, returns empty array if param is not provided and params are falsy itself', function() {
      expect(
        ducker.validate(undefined, paramTypes).length
      ).toBe(0);
    });

    describe('that is required', function() {

      var paramTypes = {
        'someStringParam': 'string!'
      };

      it('returns array with one item if param is not provided', function() {
        expect(
          ducker.validate({}, paramTypes).length
        ).toBe(1);
      });
    });

  });

  describe('having array of some params to validate', function() {
    var paramTypes = {
      'someArrayOfStringsParam': ['string']
    };
    it('returns empty array if param is legit', function() {
      expect(
        ducker.validate({
          'someArrayOfStringsParam': ['string1', 'string2', 'string3']
        }, paramTypes).length
      ).toBe(0);
    });
    it('by default, returns empty array if param is not provided', function() {
      expect(
        ducker.validate({
        }, paramTypes).length
      ).toBe(0);
    });
    it('returns array with one item if param have one non-legit value', function() {
      expect(
        ducker.validate({
          'someArrayOfStringsParam': [1]
        }, paramTypes).length
      ).toBe(1);
    });
    it('returns array with two items if param have two non-legit values', function() {
      expect(
        ducker.validate({
          'someArrayOfStringsParam': [1, 2]
        }, paramTypes).length
      ).toBe(2);
    });
    it('returns array with three items if param have three non-legit values and some number of legit ones', function() {
      expect(
        ducker.validate({
          'someArrayOfStringsParam': [1, 2, 'legit', 'legit', 2, 'legit!']
        }, paramTypes).length
      ).toBe(3);
    });
  });

  describe('having object of some params to validate', function() {

    var paramTypes = {
      'objectOfSomeParams': {
        'someStringParam': 'string'
      }
    };

    it('returns no errors for legit params', function() {
      expect(
        ducker.validate({
          'objectOfSomeParams': {
            'someStringParam': 'legit'
          }
        }, paramTypes).length
      ).toBe(0);
    });

    it('returns no errors for empty params', function() {
      expect(
        ducker.validate({

        }, paramTypes).length
      ).toBe(0);
    });

    it('returns a sequence of object params as a path if there is invalid value', function() {
      var res = ducker.validate({
        'objectOfSomeParams': {
          'someStringParam': 42
        }
      }, paramTypes);
      expect(res.length).toBe(1);
      expect(res[0].path).toEqual(['objectOfSomeParams', 'someStringParam']);
    });

    describe('and there is three levels of params', function() {
      var paramTypes = {
        'objectOfSomeParams': {
          'objectOfSomeParams2': {'someStringParam': 'string'}
        }
      };
      it('returns a sequence of object params as a path if there is invalid value', function() {
        var res = ducker.validate({
          'objectOfSomeParams': {
            'objectOfSomeParams2': {
              'someStringParam': 42
            }
          }
        }, paramTypes);
        expect(res.length).toBe(1);
        expect(res[0].path).toEqual(['objectOfSomeParams', 'objectOfSomeParams2', 'someStringParam']);
      });
    });

    describe('and there is array param used', function() {
      var paramTypes = {
        'objectOfSomeParams': {
          'objectOfSomeParams2': {'someArrayOfStringsParams': ['string']}
        }
      };
      it('returns a sequence of object params as a path and also use array index there if there is invalid value in array', function() {
        var res = ducker.validate({
          'objectOfSomeParams': {
            'objectOfSomeParams2': {
              'someArrayOfStringsParams': ['validString1', 42, 'validString2', 43]
            }
          }
        }, paramTypes);
        expect(res.length).toBe(2);
        expect(res[0].path).toEqual(['objectOfSomeParams', 'objectOfSomeParams2', 'someArrayOfStringsParams', '1']);
        expect(res[1].path).toEqual(['objectOfSomeParams', 'objectOfSomeParams2', 'someArrayOfStringsParams', '3']);
      });
      describe('and this array consists objects', function() {
        var paramTypes = {
          'objectOfSomeParams': {
            'objectOfSomeParams2': {'someArrayOfObjectsParam': [{
              'someStringParam': 'string'
            }]}
          }
        };
        it('have error path legit', function() {
          var res = ducker.validate({
            'objectOfSomeParams': {
              'objectOfSomeParams2': {
                'someArrayOfObjectsParam': [{
                  'someStringParam': 42
                }]
              }
            }
          }, paramTypes);
          expect(res.length).toBe(1);
          expect(res[0].path).toEqual(['objectOfSomeParams', 'objectOfSomeParams2', 'someArrayOfObjectsParam', '0', 'someStringParam']);
        });
      });
      describe('and these object CONSIST ARRAYS', function() {
        var paramTypes = {
          'objectOfSomeParams': {
            'objectOfSomeParams2': {
              'someArrayOfObjectsParam': [{
                'someArrayOfStringsParam': ['string']
              }]
            }
          }
        };
        it('have error path legit', function() {
          var res = ducker.validate({
            'objectOfSomeParams': {
              'objectOfSomeParams2': {
                'someArrayOfObjectsParam': [{
                  'someArrayOfStringsParam': [42]
                }]
              }
            }
          }, paramTypes);
          expect(res.length).toBe(1);
          expect(res[0].path).toEqual(['objectOfSomeParams', 'objectOfSomeParams2', 'someArrayOfObjectsParam', '0', 'someArrayOfStringsParam', '0']);
        });
      });
    });

    describe('which are required', function() {

      var paramTypes = {
        'objectOfSomeParams': {
          'someRequiredStringParam': 'string!'
        }
      };

      it('returns one error for empty param', function() {
        var res = ducker.validate({

        }, paramTypes);
        expect(
          res.length
        ).toBe(1);
      });

    });
  });

  describe('have custom validations with registerValidator() function', function() {
    ducker.registerValidator('number42validator', function(n) {
      return n === 42;
    });
    var paramTypes = {
      'customNumberParam': 'number42validator'
    };
    it('returns no errors if it is valid param', function() {
      var res = ducker.validate({
        'customNumberParam': 42
      }, paramTypes);
      expect(res.length).toBe(0);
    });
    it('returns some if it is invalid param', function() {
      var res = ducker.validate({
        'customNumberParam': 43
      }, paramTypes);
      expect(res.length).toBe(1);
    });
  });

});