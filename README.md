# ngKinvey

[![Build Status](https://travis-ci.org/ninjatronic/ngKinvey.png)](https://travis-ci.org/ninjatronic/ngKinvey)

**ngKinvey** aims to provide easy-to-consume support for BaaS services provided by [Kinvey](http://kinvey.com/).
This API allows an AngularJS app to interact with its backend on Kinvey programatically using the `$resource` and
`$q` paradigms provided by Angular.

## Dependencies

* [AngularJS 1.2.0-rc.3 or later](https://github.com/angular/angular.js/releases/tag/v1.2.0-rc.3)
* [ngBase64](https://github.com/ninjatronic/ngBase64)

## Getting Started

Make sure your app depends on the `ngKinvey` module and configure the `$kinveyProvider` in your app configuration
block...

```javascript
angular.module('myApp', ['ngKinvey']).config(['$kinveyProvider', function($kinveyProvider){
    $kinveyProvider.init({
        appKey: 'your app key',
        appSecret: 'your app secret'
    });
}]);
```

### Users

`$kinvey.User` is a `$resource` definition that provides a RESTful way of manipulating user data and some
supplementary methods which target rpc endpoints. `$kinvey` keeps track of the current user session and automatically
authenticates relevant requests using this session until the user logs out again.

```javascript
describe('your app', function() {
    var user;
    it('can log in using a username and password combination', function() {
        runs(function() {
            user = $kinvey.User.logIn({username:'myUsername',password:'myPassword'});
        });
        waitsFor(function() {
            return user.$resolved;
        });
        runs(function() {
            expect(user._id).toBeDefined();
            expect(user.username).toBe('myUsername');
        });
    });
    it('can access the current user object once logged in', function() {
        runs(function() {
            user = $kinvey.User.current();
        });
        waitsFor(function() {
            return user.$resolved;
        });
        runs(function() {
            expect(user._id).toBeDefined();
            expect(user.username).toBe('myUsername');
        });
    });
    it('can log out', function() {
        runs(function() {
            user = $kinvey.User.logout();
        });
        waitsFor(function() {
            return user.$resolved;
        });
        runs(function() {
            expect(user._id).toBeUndefined();
        });
    });
));
```

Users can sign up for your app and once this process is complete their user session is active and `$kinvey` tracks
this until the user logs out in the same way as demonstrated above.

```javascript
describe('ngKinvey', function() {
    var user;

    it('can sign up using a username and password combination', function() {
        runs(function() {
            user = $kinvey.User.signup({username:'myUsername',password:'myPassword'});
        });
        waitsFor(function() {
            return user.$resolved;
        });
        runs(function() {
            expect(user._id).toBeDefined();
            expect(user.username).toBe('myUsername');
        });
    });

));
```

### Objects

`$kinvey.Object(classname)` is a method that generates `$resource` definitions for objects in your datastore. You can
also alias `$resource` definitions for use elsewhere in your app.

```javascript
describe('ngKinvey', function() {

    it('can define an alias'), function() {
        $kinvey.alias('car', 'Car'); // this creates the alias 'Car' for your datastore 'car' entity
    });

    it('can perform CRUD with objects', function() {
        var car;
        runs(function() {
            car = new $kinvey.Car({
                make: 'Toyota',
                model: 'Yaris',
                color: 'Red'
            });
            $kinvey.Car.create(car);
        });
        waitsFor(function() {
            return car.$resolved;
        });
        runs(function() {
            expect(car._id).toBeDefined();
        });
        runs(function() {
            car.year = 2002;
            car = car.$save();
        });
        waitsFor(function() {
            return car.$resolved;
        });
        runs(function() {
            expect(car.year).toBe(2002);
        });
        runs(function() {
            $kinvey.Car.delete({_id: car._id});
        });
        waitsFor(function() {
            return car.$resolved;
        });
        runs(function() {
            expect(car._id).toBeUndefined();
        });
    });

    it('can query collections', function() {
        var results;
        runs(function() {
            result = $kinvey.Car.query({query: {year: {$gte: 2002}}});
        });
        waitsFor(function() {
            return results.$resolved;
        });
        runs(function() {
            expect(results.length).toBeGreaterThan(0);
        });
    });
});
```

## Development

This project uses Grunt for tooling. The toolbelt dependencies are managed by NPM and the production  dependencies are
managed by Bower. To develop, fork this repo and clone the code, then...

```
npm install
bower install
```

Unit and scenario tests are run with `grunt test`. To run only unit tests use `grunt testUnit`. To build the minified
file and test it use `grunt build`. **Please replace the configuration options in the scenario tests with your own app
key and secret before running the tests.**

### Issues

Issues are welcome. Please consider writing unit and scenario tests to illustrate your issue.

### Pull Requests

Pull requests are welcome. Please include unit and scenario tests which illustrate the feature you are adding, or the
issue you are solving. Please also include a minified and tested version of the ngKinvey.js file (using `grunt build`).