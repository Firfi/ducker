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
      ).toBe(1);
    });
    it('returns array with three items if param have three non-legit values and some number of legit ones', function() {
      expect(
        ducker.validate({
          'someArrayOfStringsParam': [1, 2, 'legit', 'legit', 2, 'legit!']
        }, paramTypes).length
      ).toBe(1);
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

});