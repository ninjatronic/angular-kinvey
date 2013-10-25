module.exports = function(config) {
    config.set({
        singleRun: true,
        basePath: '../',
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/ngBase64/ngBase64.js',

            'kinvey.min.js',

            'test/jasmine/**/*.js'
        ]
    });
};
