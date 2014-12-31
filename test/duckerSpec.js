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

});