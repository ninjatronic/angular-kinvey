(function() {
    'use strict';

    angular
        .module('kinvey', ['ngResource', 'ngCookies', 'ngBase64'])

        .provider('$kinvey', ['$base64', function($base64) {

            var apiVersion = 3;

            var baseUrl = 'https://baas.kinvey.com/';
            var appdata = 'appdata/';
            var userdata = 'user/';
            var groupdata = 'group/';
            var rpcdata = 'rpc/';
            var customdata = 'custom/';
            var blobdata = 'blob/';

            var headers = {
                user: {
                    'X-Kinvey-API-Version': apiVersion,
                    'Authorization': ''
                },
                basic: {
                    'X-Kinvey-API-Version': apiVersion,
                    'Authorization': ''
                }
            };

            var appKey;

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

            function toJson(obj, pretty) {
                if (typeof obj === 'undefined') return undefined;
                return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
            }

            return {

                init: function(options) {
                    if(!options || !options.appKey || !options.appSecret) {
                        throw '$kinveyProvider.init requires an options object: {\'appId\':\'YOUR APP ID\',\'appSecret\':\'YOUR APP SECRET\'}';
                    }
                    appKey = options.appKey;
                    headers.user.Authorization = headers.basic.Authorization = 'Basic '+$base64.encode(options.appKey+':'+options.appSecret);
                    angular.toJson = toJson; // this is a hacky solution to avoiding exluding mongo operators from serialization, hopefully angular will fix this in the future
                },

                $get: ['$cookieStore', '$resource', '$http', '$q', function($cookieStore, $resource, $http, $q) {
                    var oldToken = $cookieStore.get(appKey+':authToken');
                    if(oldToken) {
                        headers.user.Authorization = oldToken;
                    }

                    function handshake() {
                        var deferred = $q.defer();
                        $http.get(baseUrl + appdata + appKey, {
                            headers: headers.basic
                        }).then(
                                function(response) {
                                    deferred.resolve(response.data);
                                },
                                function(error) {
                                    deferred.reject(error);
                                }
                            );
                        return deferred.promise;
                    }

                    function Object(className) {
                        return mongolise($resource(baseUrl + appdata + appKey + '/' + className + '/:_id', {_id: '@_id'}, {
                            create: {
                                method: 'POST',
                                headers: headers.user,
                                params: {
                                    _id: ''
                                }
                            },
                            get: {
                                method: 'GET',
                                headers: headers.user
                            },
                            count: {
                                method: 'GET',
                                headers: headers.user,
                                params: {
                                    _id: '_count'
                                }
                            },
                            save: {
                                method: 'PUT',
                                headers: headers.user
                            },
                            delete: {
                                method: 'DELETE',
                                headers: headers.user
                            },
                            query: {
                                method: 'GET',
                                headers: headers.user,
                                isArray: true,
                                params: {
                                    _id: ''
                                }
                            },
                            group: {
                                method: 'POST',
                                headers: headers.user,
                                isArray: true,
                                params: {
                                    _id: '_group'
                                },
                                transformRequest: function(data) {
                                    return angular.toJson(data);
                                }
                            }
                        }));
                    }

                    var User = mongolise($resource(baseUrl + userdata + appKey + '/:_id', {_id: '@_id'} ,{
                        login: {
                            method: 'POST',
                            params: {
                                _id: 'login'
                            },
                            transformResponse: function(data) {
                                data = angular.fromJson(data);
                                if(!data.error) {
                                    headers.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                    $cookieStore.put(appKey+':authToken', 'Kinvey '+data._kmd.authtoken);
                                }
                                return new User(data);
                            },
                            headers: headers.user
                        },
                        current: {
                            method: 'GET',
                            params: {
                                _id: '_me'
                            },
                            headers: headers.user
                        },
                        logout: {
                            method: 'POST',
                            params: {
                                _id: '_logout'
                            },
                            transformResponse: function() {
                                headers.user.Authorization = headers.basic.Authorization;
                                $cookieStore.remove(appKey+':authToken');
                            },
                            headers: headers.user
                        },
                        signup: {
                            method: 'POST',
                            headers: headers.basic,
                            transformResponse: function(data) {

                                data = angular.fromJson(data);
                                if(!data.error) {
                                    headers.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                    $cookieStore.put(appKey+':authToken', 'Kinvey '+data._kmd.authtoken);
                                }
                                return new User(data);
                            }
                        },
                        get: {
                            method: 'GET',
                            headers: headers.user
                        },
                        lookup: {
                            method: 'POST',
                            headers: headers.user,
                            isArray:true,
                            params: {
                                _id: '_lookup'
                            }
                        },
                        save:   {
                            method:'PUT',
                            headers: headers.user
                        },
                        query:  {
                            method:'GET',
                            headers: headers.user,
                            isArray:true,
                            params: {
                                _id: ''
                            }
                        },
                        delete: {
                            method:'DELETE',
                            params: {
                                hard: true
                            },
                            headers: headers.user
                        },
                        suspend: {
                            method:'DELETE',
                            headers: headers.user
                        },
                        verifyEmail: {
                            method: 'POST',
                            headers: headers.basic,
                            url: baseUrl+rpcdata+appKey+'/:username:email/user-email-verification-initiate',
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
                            headers: headers.basic,
                            url: baseUrl+rpcdata+appKey+'/:username:email/user-password-reset-initiate',
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
                            headers: headers.basic,
                            url: baseUrl+rpcdata+appKey+'/check-username-exists'
                        }
                    }));

                    var Group = $resource(baseUrl + groupdata + appKey + '/:_id', {_id: '@_id'}, {
                        get: {
                            method: 'GET',
                            headers: headers.user
                        },
                        save: {
                            method: 'PUT',
                            headers: headers.user
                        },
                        delete: {
                            method: 'DELETE',
                            headers: headers.user
                        }
                    });

                    var fileFunctions = {
                        upload: function(metadata, mimeType, filedata, filename) {
                            var deferred = $q.defer();

                            metadata._filename = filename || metadata._filename;

                            $http({
                                method: metadata._id ? 'PUT' : 'POST',
                                url: baseUrl + blobdata + appKey + (metadata._id ? '/' + metadata._id : ''),
                                headers: angular.extend({
                                    'X-Kinvey-Content-Type': mimeType
                                }, headers.user),
                                data: metadata
                            }).then(function(response) {
                                    var file = new File(response.data);
                                    $http({
                                        method: 'PUT',
                                        url: file._uploadURL,
                                        headers: angular.extend({
                                            'Content-Type': mimeType,
                                            'Content-Length': filedata.length,
                                            'Accept': undefined
                                        }, file._requiredHeaders),
                                        data: filedata
                                    }).then(function() {
                                            deferred.resolve(file);
                                        }, function(err) {
                                            deferred.reject(err.data);
                                        });
                                }, function(error) {
                                    deferred.reject(error.data);
                                });

                            return deferred.promise;
                        },
                        download: function(target, ttl) {
                            var deferred = $q.defer();

                            var args = {_id: target._id ? target._id : target};
                            if(ttl) {
                                args.ttl_in_seconds = ttl
                            }
                            var file = File.get(args);
                            file.$promise
                                .then(function() {
                                    $http.get(file._downloadURL, {})
                                        .then(function(response) {
                                            deferred.resolve(response.data);
                                        }, function(err) {
                                            deferred.reject(err);
                                        });
                                }, function(err) {
                                    deferred.reject(err);
                                });

                            return deferred.promise;
                        }
                    };
                    function addFileFunctions(resourceDef) {
                        resourceDef.upload = fileFunctions.upload;
                        resourceDef.download = fileFunctions.download;
                        return resourceDef;
                    };

                    var mongoMethods = ['query', 'delete'];
                    function mongolise(resourceDef) {
                        angular.forEach(mongoMethods, function(method) {
                            var origMethod = resourceDef[method];
                            resourceDef[method] = function(a1, a2, a3, a4) {
                                if(a1.query) {
                                    a1.query = JSON.stringify(a1.query);
                                }
                                return origMethod(a1, a2, a3, a4);
                            };
                        });
                        var origGroup = resourceDef.group;
                        resourceDef.group = function(a1) {
                            if(a1.reduce) {
                                a1.reduce = a1.reduce.toString();
                                a1.reduce = a1.reduce.replace(/\n/g,'');
                                a1.reduce = a1.reduce.replace(/\s/g,'');
                            }
                            return origGroup(a1);
                        };
                        return resourceDef;
                    }

                    var File = addFileFunctions(mongolise($resource(baseUrl + blobdata + appKey + '/:_id', {_id: '@_id'}, {
                        get: {
                            method: 'GET',
                            headers: headers.user
                        },
                        query:  {
                            method:'GET',
                            headers: headers.user,
                            isArray:true,
                            params: {
                                _id: ''
                            }
                        },
                        delete: {
                            method:'DELETE',
                            headers: headers.user
                        }
                    })));

                    function verifyAlias(alias, protectedName) {
                        if(alias === protectedName) {
                            throw 'aliases must not attempt to overwrite $kinvey.'+protectedName;
                        }
                    }

                    function alias(classname, aliasname) {
                        verifyAlias(aliasname, 'handshake');
                        verifyAlias(aliasname, 'User');
                        verifyAlias(aliasname, 'Group');
                        verifyAlias(aliasname, 'Object');
                        verifyAlias(aliasname, 'alias');

                        retVal[aliasname] = Object(classname);
                    }

                    function rpc(endpoint, data) {
                        var deferred = $q.defer();
                        $http.post(baseUrl + rpcdata + appKey + '/' + customdata + endpoint, data, {
                            headers: headers.user
                        }).then(
                            function(response) {
                                deferred.resolve(response.data);
                            },
                            function(error) {
                                deferred.reject(error);
                            }
                        );
                        return deferred.promise;
                    }

                    var retVal = {
                        handshake: handshake,
                        User: User,
                        Group: Group,
                        Object: Object,
                        File: File,
                        alias: alias,
                        rpc: rpc
                    };

                    return retVal;
                }]
            };
    }]);
})();