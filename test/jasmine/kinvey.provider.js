describe('$kinveyProvider', function() {
    var kinveyProvider;

    beforeEach(function() {
        angular.module('test',[]).config(function($kinveyProvider) {
            kinveyProvider = $kinveyProvider;
        });
        module('ngKinvey', 'test');
        inject(function() {});
    });

    describe('init', function() {
        it('should be defined', function() {
            expect(kinveyProvider.init).toBeDefined();
        });

        it('should throw an error if no options supplied', function() {
            expect(kinveyProvider.init).toThrow();
        });

        it('should throw an error if no appKey in options', function() {
            var error;
            try{
                kinveyProvider.init({appSecret:''});
            } catch(err) {
                error = err;
            }
            expect(error).toBeDefined();
        });

        it('should throw an error if no appSecret in options', function() {
            var error;
            try{
                kinveyProvider.init({appKey:''});
            } catch(err) {
                error = err;
            }
            expect(error).toBeDefined();
        });
    });
});