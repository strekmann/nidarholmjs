module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/js/**/*.js', 'server/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                ignores: ['public/**/*.js'],
                globals: {
                    jQuery: true
                }
            }
        },
        browserify: {
            build: {
                dest: 'public/js/site.js',
                src: ['client/js/index.js'],
                options: {
                    alias: ['client/js/index.js:s7n']
                }
            }
        },
        sass: {
            options: {
                includePaths: [
                    'bower_components/foundation/scss',
                    'bower_components/font-awesome/scss'
                ]
            },
            dest: {
                options: {
                    outputStyle: 'compressed'
                },
                files: {
                    'tmp/css/styles.css': 'client/scss/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: [
                    'client/vendor/css/**/*.css',
                    'tmp/css/styles.css'
                ],
                dest: 'public/css/site.css'
            },
            vendor: {
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/jquery/jquery.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/moment.js',
                    'bower_components/ractive/Ractive.js',
                    'bower_components/ractive-events-tap/Ractive-events-tap.js',
                    'client/vendor/js/*.js'
                ],
                dest: 'public/js/vendor.js'
            }
        },
        copy: {
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/foundation/js/vendor/modernizr.js'],
                dest: 'public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/font-awesome/fonts/*'],
                dest: 'public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'client/img',
                src: ['**'],
                dest: 'public/img/'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'public/js/vendor.js': ['public/js/vendor.js']
                }
            },
            client: {
                files: {
                    'public/js/site.js': ['public/js/site.js']
                }
            }
        },
        watch: {
            clientjs: {
                files: ['client/js/**/*.js'],
                tasks: ['jshint', 'browserify']
            },
            scss: {
                files: ['client/scss/**/*.scss'],
                tasks: ['sass', 'concat:css']
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'cluster.js',
                    watchedExtensions: ['js', 'html']
                }
            }
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        abideExtract: {
            js: {
                src: 'server/**/*.js',
                dest: 'locale/templates/LC_MESSAGES/messages.pot'
            },
            jade: {
                src: 'server/views/**/*.jade',
                dest: 'locale/templates/LC_MESSAGES/messages.pot',
                options: {
                    language: 'jade',
                    keyword: '__'
                }
            }
        },
        abideMerge: {
            messages: {
                options: {
                    template: 'locale/templates/LC_MESSAGES/messages.pot',
                    localeDir: 'locale',
                }
            }
        },
        abideCompile: {
            json: {
                dest: 'public/locale/',
                options: {
                    type: 'json'
                }
            }
        }
    });

    //grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-i18n-abide');

    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('translate', ['abideExtract', 'abideMerge'])
}
