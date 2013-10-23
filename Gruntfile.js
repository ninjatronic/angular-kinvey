'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['<%= pkg.name %>.js'],
            options: {
                globals: {
                    // Angular
                    angular: false,

                    // Grunt
                    module: false,

                    // Facebook
                    FB: false,

                    // document
                    document: false
                }
            }
        },
        karma: {
            jasmine: {
                configFile: 'test/jasmine.conf.js'
            },
            scenario: {
                configFile: 'test/scenario.conf.js'
            },
            jasmineMin: {
                configFile: 'test/jasmineMin.conf.js'
            },
            scenarioMin: {
                configFile: 'test/scenarioMin.conf.js'
            }
        },
        strip: {
            all: {
                src: '<%= pkg.name %>.min.js',
                options: {
                    inline: true
                }
            }
        },
        uglify: {
            src: {
                files: {
                    '<%= pkg.name %>.min.js': ['<%= pkg.name %>.js']
                }
            }
        },
        watch: {
            all: {
                files: ['Gruntfile.js', '<%= pkg.name %>.js', 'test/**/*.*'],
                tasks: ['jshint', 'karma:jasmine', 'karma:scenario']
            },
            unit: {
                files: ['Gruntfile.js', '<%= pkg.name %>.js', 'test/**/*.*'],
                tasks: ['jshint', 'karma:jasmine']
            },
            hint: {
                files: ['Gruntfile.js', '<%= pkg.name %>.js', 'test/**/*.*'],
                tasks: ['jshint']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-strip');

    grunt.registerTask('test', ['jshint', 'karma:jasmine', 'karma:scenario']);
    grunt.registerTask('testAll', ['jshint', 'karma:jasmine', 'karma:scenario', 'karma:jasmineMin', 'karma:scenarioMin']);
    grunt.registerTask('build', ['uglify', 'strip', 'karma:jasmineMin', 'karma:scenarioMin']);
    grunt.registerTask('default', ['watch:all']);
};
