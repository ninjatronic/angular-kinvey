# angular-kinvey

[![Build Status](https://travis-ci.org/ninjatronic/angular-kinvey.png)](https://travis-ci.org/ninjatronic/angular-kinvey)

AngularJS support for Kinvey BaaS

**Currently under active development**

## Dependencies

* [angular-base64](https://github.com/ninjatronic/angular-base64)

## Tooling

```
npm install
```

### Testing
```
grunt test
```

### Building
```
grunt build
```

## Usage

### Initialization

```javascript
app.module('myApp', ['kinvey']).config(['$kinveyProvider', function($kinveyProvider) {
    $kinveyProvider.init({
        appKey:'myAppKey',
        appSecret:'myAppSecret'
    });
}]);
```

### Handshake

Handshake returns a promise.

```javascript
app.module('myApp').controller('handshakeController', ['$kinvey', '$scope', function($kinvey, $scope) {
    $scope.handshake = $kinvey.handshake();
}]);
```

### Users

`$kinvey.user` is a `$resource`. Usage examples here do not wait for resolutions. Use `$resolved` or `$then`.

```javascript
app.module('myApp').controller('userController', ['$kinvey', '$scope', function($kinvey, $scope) {
    // log in
    $scope.user = $kinvey.user.login({
        username: 'username',
        password: 'password'
    });

    // sign up
    $scope.user = $kinvey.user.signup({
        username: 'username',
        password: 'password'
    });

    // get
    $scope.user = $kinvey.user.get({
        _id: 'userId'
    });

    // current user
    $scope.user = $kinvey.user.current();

    // save
    $kinvey.user.$save();

    // query
    $scope.users = $kinvey.user.query({age:{gte:31}});

    // discovery
    $scope.users = $kinvey.user.lookup({first_name:'Dave'});

    // logout
    $kinvey.user.logout();
}]);
```

### Groups

`$kinvey.group` is a `$resource`. Usage examples here do not wait for resolutions. Use `$resolved` or `$then`.

```javascript
app.module('myApp').controller('groupController', ['$kinvey', '$scope', function($kinvey, $scope) {
    // create
    $scope.group = $kinvey.group.create({_id: 'users'});

    // retrieve
    $scope.group = $kinvey.group.get({
        _id: 'users'
    });

    // update
    $scope.group.users = {all:true};
    $scope.group.$save();

    // delete
    $scope.group.delete({
       _id: 'users'
   });
}]);
```

### Objects

`$kinvey.object(classname)` is a `$resource`. Usage examples here do not wait for resolutions. Use `$resolved` or `$then`.

```javascript
app.module('myApp').controller('objectController', ['$kinvey', '$scope', function($kinvey, $scope) {
    // create
    $scope.badger = $kinvey.object('badger').create({name:'Steve'});

    // retrieve
    $scope.badger = $kinvey.object('badger').get({_id: $scope.badger._id});

    // update
    $scope.badger.age=31;
    $scope.badger.$save();

    // query
    $scope.badgers = $kinvey.object('badger').query({query:{age:31}});

    // delete
    $scope.badger.$delete();
}]);
```