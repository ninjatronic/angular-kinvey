(function() {
    'use strict';

    angular
        .module('kinvey', ['ngResource', 'base64'])

        // this constant contains strings for url building
        .constant('$kUrl', {
            base: 'https://baas.kinvey.com/',
            appdata: 'appdata/',
            user: 'user/',
            group: 'group/',
            rpc: 'rpc/',
            custom: 'custom/',
            blob: 'blob/',
            push: 'push/'
        })

        // this is the target Kinvey API version
        .constant('$kVer', 3)

        // this constant contains the live header objects
        .constant('$kHead', {
            user: {
                'X-Kinvey-API-Version': '',
                'Authorization': ''
            },
            basic: {
                'X-Kinvey-API-Version': '',
                'Authorization': ''
            }
        })

        // these are error strings
        .constant('$kErr', {
            init: '$kinveyProvider.init requires an options object: {\'appId\':\'YOUR APP ID\',\'appSecret\':\'YOUR APP SECRET\'}',
            alias: 'aliases must not attempt to overwrite $kinvey.'
        })

        // this is the custom serializer which protects mongo operators in the `$` namespace
        .constant('$kSerialize', function(obj, pretty) {
            var mongoOperators = [
                "$gt", "$gte", "$in", "$lt", "$lte", "$ne", "$nin", // comparison
                "$or", "$and", "$not", "$nor", // logical
                "$exists", "$type", // element
                "$mod", "$regex", "$where", //evaluation
                "$geoWithin", "$geoIntersects", "$near", "$nearSphere", //geospatial
                "$all", "$elemMatch", "$size", // array
                "$", "$elemMatch", "$slice" // projection
            ];

            function isWindow(obj) {
                return obj && obj.document && obj.location && obj.alert && obj.setInterval;
            }

            function isScope(obj) {
                return obj && obj.$evalAsync && obj.$watch;
            }

            function toJsonReplacer(key, value) {
                var val = value;

                if (typeof key === 'string' && key.charAt(0) === '$') {
                    var isMongo = false;
                    angular.forEach(mongoOperators, function(op) {
                        if(op == key) {
                            isMongo = true;
                        }
                    });
                    if(!isMongo) {
                        val = undefined;
                    }
                } else if (isWindow(value)) {
                    val = '$WINDOW';
                } else if (value &&  document === value) {
                    val = '$DOCUMENT';
                } else if (isScope(value)) {
                    val = '$SCOPE';
                }

                return val;
            }

            if (typeof obj === 'undefined') return undefined;
            return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);

        })

        // this is the service provider
        .provider('$kinvey', [
            '$kUrl', '$kHead', '$kVer', '$kErr', '$kSerialize', '$base64',
            function($kUrl, $kHead, $kVer, $kErr, $kSerialize, $base64) {

                // strap up the headers with the target API version
                $kHead.user['X-Kinvey-API-Version'] = $kVer;
                $kHead.basic['X-Kinvey-API-Version'] = $kVer;

                var appKey;
                var storageOption;

                return {

                    init: function(options) {

                        // there are certain mandatory initialisation options
                        if(!options || !('appKey' in options) || !('appSecret' in options)) {
                            throw $kErr.init;
                        }

                        appKey = options.appKey;
                        storageOption = options.storage;

                        // strap up the headers with the basic authentication string
                        var auth = 'Basic '+$base64.encode(options.appKey+':'+options.appSecret);

                        $kHead.user.Authorization = auth;
                        $kHead.basic.Authorization = auth;
                    },

                    $get: ['$resource', '$http', '$q', function($resource, $http, $q) {


                        var storageAdapter;
                        switch(storageOption) {
                            case 'cookies':
                                inject(['$cookieStore', function($cookieStore) {
                                    storageAdapter = $cookieStore;
                                }]);
                                break;
                            case 'local':
                                inject(['$localStorage', function($localStorage) {
                                    storageAdapter = {
                                        get: function(key) {
                                            return $localStorage[key];
                                        },
                                        put: function(key, value) {
                                            $localStorage[key] = value;
                                        },
                                        remove: function(key) {
                                            $localStorage[key] = undefined;
                                        }
                                    };
                                }]);
                                break;
                            default:
                                var temp = {};
                                storageAdapter = {
                                    get: function(key) {
                                        return temp[key];
                                    },
                                    put: function(key, value) {
                                        temp[key] = value;
                                    },
                                    remove: function(key) {
                                        temp[key] = undefined;
                                    }
                                };
                                break;
                        }

                        /*
                            RETRIEVE THE LAST SESSION FROM COOKIES
                         */
                        var oldToken = storageAdapter.get(appKey+':authToken');
                        if(oldToken) {
                            $kHead.user.Authorization = oldToken;
                        }

                        /*
                            CUSTOM HTTP TARGETS NOT GENERATED BY THE $resource DECLARATIONS
                         */
                        var funcDefs = {
                            handshake: function() {
                                return {
                                    method: 'GET',
                                    url: $kUrl.base + $kUrl.appdata + appKey,
                                    headers: $kHead.basic
                                };
                            },
                            rpc: function(endpoint, data) {
                                return {
                                    method: 'POST',
                                    url: $kUrl.base + $kUrl.rpc + appKey + '/' + $kUrl.custom + endpoint,
                                    headers: $kHead.user,
                                    data: data
                                };
                            },
                            upload: function(file, filedata, mimeType) {
                                return {
                                    method: 'PUT',
                                    url: file._uploadURL,
                                    data: filedata,
                                    headers: angular.extend({
                                        'Content-Type': mimeType,
                                        'Accept': undefined
                                    }, file._requiredHeaders),
                                    transformRequest: angular.identity
                                };
                            },
                            download: function(file) {
                                return {
                                    method: 'GET',
                                    url: file._downloadURL
                                };
                            },
                            saveFile: function(file, mimeType) {
                                return {
                                    method: file._id ? 'PUT' : 'POST',
                                    url: $kUrl.base + $kUrl.blob + appKey + (file._id ? '/'+file._id : ''),
                                    headers: angular.extend({
                                        'X-Kinvey-Content-Type': mimeType
                                    }, $kHead.user),
                                    data: file
                                };
                            }
                        };

                        /*
                         STRINGS FOR MONGO COMPATABILITY
                         */
                        var mongoMethods = ['query', 'delete'];

                        /*
                            THESE METHODS PROVIDE WAYS TO AUGMENT WORKFLOW WITH COMMON ADDITIONS
                         */

                        // decorates an acting promise function with a `$resource` style response structure
                        function augmentPromise(actor, orig) {
                            var deferred = $q.defer();
                            var retVal = orig || { };

                            if(!('$resolved' in retVal)) {
                                retVal.$resolved = false;
                            }
                            retVal.$promise = deferred.promise;

                            actor(retVal, deferred);

                            return retVal;
                        }

                        // provides a resolving function that manipulates a `$resource` style response structure
                        function augmentResolve(returningObj, deferred, transformResponse) {
                            return function(response) {
                                var publicResponse = transformResponse ? transformResponse(response) : response;
                                angular.extend(returningObj, publicResponse);
                                returningObj.$resolved = true;
                                deferred.resolve(publicResponse);
                            };
                        }

                        // provides a rejecting function that manipulates a `$resource` style response structure
                        function augmentReject(deferred, transformResponse) {
                            return function(response) {
                                var publicResponse = transformResponse ? transformResponse(response) : response;
                                deferred.reject(publicResponse);
                            };
                        }

                        // provides special serialization for methods that require mongo-friendly serialization
                        function augmentForMongo(resourceDef) {
                            angular.forEach(mongoMethods, function(method) {
                                var origMethod = resourceDef[method];
                                resourceDef[method] = function(a1, a2, a3, a4) {
                                    if(a1 && 'query' in a1) {
                                        a1.query = JSON.stringify(a1.query);
                                    }
                                    return origMethod(a1, a2, a3, a4);
                                };
                            });
                            var origGroup = resourceDef.group;
                            resourceDef.group = function(a1, a2, a3) {
                                if(a1.reduce) {
                                    a1.reduce = a1.reduce.toString();
                                    a1.reduce = a1.reduce.replace(/\n/g,'');
                                    a1.reduce = a1.reduce.replace(/\s/g,'');
                                }
                                return origGroup(undefined, a1, a2, a3);
                            };
                            return resourceDef;
                        }

                        // augments the File `$resource` definition with extra, promise based methods
                        function augmentFileDef(resourceDef) {

                            resourceDef.prototype.$download = function() {
                                var file = this;
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.download(file))
                                        .then(
                                            augmentResolve(retVal, deferred, getData),
                                            augmentReject(deferred, getData));
                                });
                            };
                            resourceDef.prototype.$upload = function(filedata, mimeType) {
                                var file = this;
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.upload(file, filedata, mimeType))
                                        .then(
                                            augmentResolve(retVal, deferred, getData),
                                            augmentReject(deferred, getData));
                                });
                            };
                            resourceDef.prototype.$save = function(mimeType) {
                                var file = this;
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.saveFile(file, mimeType))
                                        .then(
                                            augmentResolve(retVal, deferred, getFile),
                                            augmentReject(deferred, getData));
                                }, file);
                            };

                            resourceDef.upload = function(file, filedata, mimeType) {
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.upload(file, filedata, mimeType))
                                        .then(
                                            augmentResolve(retVal, deferred, getData),
                                            augmentReject(deferred, getData));
                                });
                            };
                            resourceDef.download = function(file) {
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.download(file))
                                        .then(
                                            augmentResolve(retVal, deferred, getData),
                                            augmentReject(deferred, getData));
                                });
                            };
                            resourceDef.save = function(file, mimeType) {
                                return augmentPromise(function(retVal, deferred) {
                                    $http(funcDefs.saveFile(file, mimeType))
                                        .then(
                                            augmentResolve(retVal, deferred, getFile),
                                            augmentReject(deferred, getData));
                                }, file);
                            };

                            return resourceDef;
                        }

                        // augments the Object `$resource` definition
                        function augmentObjectDef(className, resourceDef) {

                            resourceDef.save = function(obj) {
                                if(obj._id) {
                                    return Object(className).update(obj);
                                } else {
                                    return Object(className).create(obj);
                                }
                            };

                            resourceDef.prototype.$save = function(args) {
                                if(args && args._id && !this._id) {
                                    this._id = args._id;
                                }
                                if(this._id) {
                                    return this.$update(args);
                                } else {
                                    return this.$create(args);
                                }
                            };

                            return resourceDef;
                        }

                        // gets the data component of a `$http` response object
                        function getData(response) {
                            return response.data;
                        }

                        // gets a File from a `$http` repsonse object
                        function getFile(response) {
                            return new File(getData(response));
                        }

                        /*
                            THESE METHODS PERFORM SIMPLE 'ROUNDTRIP' OPERATIONS
                         */

                        // performs a simple handshake
                        function handshake() {
                            return augmentPromise(function(retVal, deferred) {
                                $http(funcDefs.handshake())
                                    .then(
                                        augmentResolve(retVal, deferred, getData),
                                        augmentReject(deferred, getData));
                            });
                        }

                        // performs an rpc call
                        function rpc(endpoint, data) {
                            return augmentPromise(function(retVal, deferred) {
                                $http(funcDefs.rpc(endpoint, data))
                                    .then(
                                        augmentResolve(retVal, deferred, getData),
                                        augmentReject(deferred, getData));
                            });
                        }

                        /*
                            HERE BE `$resource` DEFINITIONS AND FACTORIES
                         */

                        // Object `$resource` definition factory
                        var Object = function(className) {
                            return augmentObjectDef(className,
                                augmentForMongo(
                                    $resource($kUrl.base + $kUrl.appdata + appKey + '/' + className + '/:_id', {_id: '@_id'}, {
                                        create: {
                                            method: 'POST',
                                            transformResponse: function(data) {
                                                return new (Object(className))(angular.fromJson(data));
                                            },
                                            headers: $kHead.user,
                                            params: {
                                                _id: ''
                                            }
                                        },
                                        get: {
                                            method: 'GET',
                                            transformResponse: function(data) {
                                                return new (Object(className))(angular.fromJson(data));
                                            },
                                            headers: $kHead.user
                                        },
                                        count: {
                                            method: 'GET',
                                            headers: $kHead.user,
                                            params: {
                                                _id: '_count'
                                            }
                                        },
                                        update: {
                                            method: 'PUT',
                                            transformResponse: function(data) {
                                                return new (Object(className))(angular.fromJson(data));
                                            },
                                            headers: $kHead.user
                                        },
                                        delete: {
                                            method: 'DELETE',
                                            headers: $kHead.user
                                        },
                                        query: {
                                            method: 'GET',
                                            transformResponse: function(data) {
                                                var retVal = [];
                                                var objs = angular.fromJson(data);
                                                angular.forEach(objs, function(obj) {
                                                    retVal.push(new (Object(className))(obj));
                                                });
                                                return retVal;
                                            },
                                            headers: $kHead.user,
                                            isArray: true,
                                            params: {
                                                _id: ''
                                            }
                                        },
                                        group: {
                                            method: 'POST',
                                            headers: $kHead.user,
                                            isArray: true,
                                            params: {
                                                _id: '_group'
                                            },
                                            transformRequest: function(data) {
                                                return $kSerialize(data);
                                            }
                                        }
                                    })));
                        };

                        // User `$resource` definition
                        var User =
                            augmentForMongo(
                                $resource($kUrl.base + $kUrl.user + appKey + '/:_id', {_id: '@_id'} ,{
                                    login: {
                                        method: 'POST',
                                        params: {
                                            _id: 'login'
                                        },
                                        transformResponse: function(data) {
                                            data = angular.fromJson(data);
                                            if(!data.error) {
                                                $kHead.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                                storageAdapter.put(appKey+':authToken', 'Kinvey '+data._kmd.authtoken);
                                            }
                                            return new User(data);
                                        },
                                        headers: $kHead.user
                                    },
                                    current: {
                                        method: 'GET',
                                        params: {
                                            _id: '_me'
                                        },
                                        transformResponse: function(data) {
                                            return new User(angular.fromJson(data));
                                        },
                                        headers: $kHead.user
                                    },
                                    logout: {
                                        method: 'POST',
                                        params: {
                                            _id: '_logout'
                                        },
                                        transformResponse: function() {
                                            $kHead.user.Authorization = $kHead.basic.Authorization;
                                            storageAdapter.remove(appKey+':authToken');
                                        },
                                        headers: $kHead.user
                                    },
                                    signup: {
                                        method: 'POST',
                                        headers: $kHead.basic,
                                        transformResponse: function(data) {

                                            data = angular.fromJson(data);
                                            if(!data.error) {
                                                $kHead.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                                storageAdapter.put(appKey+':authToken', 'Kinvey '+data._kmd.authtoken);
                                            }
                                            return new User(data);
                                        }
                                    },
                                    get: {
                                        method: 'GET',
                                        transformResponse: function(data) {
                                            return new User(angular.fromJson(data));
                                        },
                                        headers: $kHead.user
                                    },
                                    lookup: {
                                        method: 'POST',
                                        transformResponse: function(data) {
                                            var retVal = [];
                                            data = angular.fromJson(data);
                                            angular.forEach(data, function(user) {
                                                retVal.push(new User(user));
                                            });
                                            return retVal;
                                        },
                                        headers: $kHead.user,
                                        isArray:true,
                                        params: {
                                            _id: '_lookup'
                                        }
                                    },
                                    save:   {
                                        method:'PUT',
                                        transformResponse: function(data) {
                                            return new User(angular.fromJson(data));
                                        },
                                        headers: $kHead.user
                                    },
                                    query:  {
                                        url: $kUrl.base + $kUrl.user + appKey + '/?query=:query',
                                        method:'GET',
                                        transformResponse: function(data) {
                                            var retVal = [];
                                            data = angular.fromJson(data);
                                            angular.forEach(data, function(user) {
                                                retVal.push(new User(user));
                                            });
                                            return retVal;
                                        },
                                        headers: $kHead.user,
                                        isArray:true,
                                        params: { }
                                    },
                                    delete: {
                                        method:'DELETE',
                                        params: {
                                            hard: true
                                        },
                                        headers: $kHead.user
                                    },
                                    suspend: {
                                        method:'DELETE',
                                        headers: $kHead.user
                                    },
                                    verifyEmail: {
                                        method: 'POST',
                                        headers: {
                                            Authorization: $kHead.basic.Authorization,
                                            'X-Kinvey-API-Version': $kHead.basic['X-Kinvey-API-Version'],
                                            'Content-Type': undefined
                                        },
                                        url: $kUrl.base+$kUrl.rpc+appKey+'/:username:email/user-email-verification-initiate',
                                        params: {
                                            username: '@username',
                                            email: '@email'
                                        },
                                        transformRequest: function() {
                                            return '';
                                        }
                                    },
                                    resetPassword: {
                                        method: 'POST',
                                        headers: $kHead.basic,
                                        url: $kUrl.base+$kUrl.rpc+appKey+'/:username:email/user-password-reset-initiate',
                                        params: {
                                            username: '@username',
                                            email: '@email'
                                        },
                                        transformRequest: function() {
                                            return '';
                                        }
                                    },
                                    checkUsernameExists: {
                                        method: 'POST',
                                        headers: $kHead.basic,
                                        url: $kUrl.base+$kUrl.rpc+appKey+'/check-username-exists'
                                    }
                                }));

                        // Group `$resource` definition
                        var Group =
                                $resource($kUrl.base + $kUrl.group + appKey + '/:_id', {_id: '@_id'}, {
                            get: {
                                method: 'GET',
                                headers: $kHead.user
                            },
                            save: {
                                method: 'PUT',
                                headers: $kHead.user
                            },
                            delete: {
                                method: 'DELETE',
                                headers: $kHead.user
                            }
                        });

                        // File `$resource` definition
                        var File =
                            augmentFileDef(
                                augmentForMongo(
                                    $resource($kUrl.base + $kUrl.blob + appKey + '/:_id', {_id: '@_id'}, {
                            get: {
                                method: 'GET',
                                headers: $kHead.user,
                                transformResponse: function(data) {
                                    return new File(angular.fromJson(data));
                                }
                            },
                            query:  {
                                method:'GET',
                                headers: $kHead.user,
                                isArray:true,
                                params: {
                                    _id: ''
                                },
                                transformResponse: function(data) {
                                    var retVal = [];
                                    angular.forEach(angular.fromJson(data), function(obj) {
                                        retVal.push(new File(obj));
                                    });
                                    return retVal;
                                }
                            },
                            delete: {
                                method:'DELETE',
                                headers: $kHead.user
                            }
                        })));

                        var Push =
                                $resource($kUrl.base + $kUrl.push + appKey + '/:verb', {verb: '@verb'}, {
                            register: {
                                method: 'POST',
                                headers: $kHead.user,
                                params: {
                                    verb: 'register-device'
                                }
                            },
                            unregister: {
                                method: 'POST',
                                headers: $kHead.user,
                                params: {
                                    verb: 'unregister-device'
                                }
                            }
                        });

                        /*
                            THESE METHODS ALLOW ALIASES FOR OBJECT DEFINITIONS TO BE CREATED
                         */

                        // verify that a critical method is not being overridden
                        function verifyAlias(alias, protectedName) {
                            if(alias === protectedName) {
                                throw $kErr.alias+protectedName;
                            }
                        }

                        // set up an alias
                        function alias(classname, aliasname) {
                            verifyAlias(aliasname, 'handshake');
                            verifyAlias(aliasname, 'User');
                            verifyAlias(aliasname, 'Group');
                            verifyAlias(aliasname, 'Object');
                            verifyAlias(aliasname, 'alias');

                            api[aliasname] = Object(classname);
                        }

                        /*
                            THIS STATEMENT RETURNS THE PUBLIC API
                         */

                        var api = {
                            handshake: handshake,
                            User: User,
                            Group: Group,
                            Object: Object,
                            File: File,
                            Push: Push,
                            alias: alias,
                            rpc: rpc
                        };
                        return api;
                    }]
                };
    }]);
})();