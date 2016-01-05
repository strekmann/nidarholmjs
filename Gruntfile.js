module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            server: {
                src: ['server/**/*.js'],
                options: {
                    curly: true,
                    undef: true,
                    unused: true,
                    eqeqeq: true,
                    eqnull: true,
                    node: true
                }
            },
            client: {
                src: ['client/js/**/*.js'],
                options: {
                    curly: true,
                    undef: true,
                    unused: 'vars',
                    eqeqeq: true,
                    eqnull: true,
                    browser: true,
                    globals: {
                        module: false,
                        require: false,
                        console: false
                    }
                }
            }
        },
        browserify: {
            build: {
                dest: 'public/js/site.js',
                src: ['client/js/index.js'],
                options: {
                    alias: ['./client/js/index.js:s7n']
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
                files: {
                    '/tmp/styles.css': 'client/scss/styles.scss'
                }
            }
        },
        coffee: {
            compile: {
                options: {
                    bare: true
                },
                files: {
                    '/tmp/chosen.js': [
                        'bower_components/chosen/coffee/lib/abstract-chosen.coffee',
                        'bower_components/chosen/coffee/lib/select-parser.coffee',
                        'bower_components/chosen/coffee/chosen.jquery.coffee'
                    ]
                }
            }
        },
        concat: {
            css: {
                src: [
                    'client/vendor/css/**/*.css',
                    'bower_components/pickadate/lib/themes/default.css',
                    'bower_components/pickadate/lib/themes/default.date.css',
                    'bower_components/pickadate/lib/themes/default.time.css',
                    'bower_components/select2/select2.css',
                    'bower_components/dropzone/downloads/css/dropzone.css',
                    'bower_components/simplemde/dist/simplemde.min.css',
                    '/tmp/styles.css'
                ],
                dest: 'public/css/site.css'
            },
            vendor: {
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/jquery/dist/jquery.js',
                    //'bower_components/foundation/js/vendor/fastclick.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/min/moment-with-locales.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/ractive/ractive.js',
                    'bower_components/ractive-events-tap/ractive-events-tap.js',
                    'bower_components/ractive-decorators-sortable/Ractive-decorators-sortable.js',
                    'bower_components/ractive-transitions-fade/ractive-transitions-fade.js',
                    'bower_components/ractive-transitions-slide/ractive-transitions-slide.js',
                    'bower_components/pickadate/lib/picker.js',
                    'bower_components/pickadate/lib/picker.date.js',
                    'bower_components/pickadate/lib/picker.time.js',
                    'bower_components/pickadate/lib/translations/nb_NO.js',
                    'bower_components/ace-builds/src-noconflict/ace.js',
                    'bower_components/ace-builds/src-noconflict/theme-tomorrow.js',
                    'bower_components/ace-builds/src-noconflict/mode-markdown.js',
                    'bower_components/unorm/lib/unorm.js',
                    'bower_components/uslug/lib/uslug.js',
                    'bower_components/iscroll/build/iscroll.js',
                    'bower_components/select2/select2.js',
                    'bower_components/simplemde/dist/simplemde.min.js',
                    '/tmp/chosen.js',
                    'client/vendor/js/*.js',
                    'bower_components/dropzone/downloads/dropzone.js'
                ],
                dest: 'public/js/vendor.js'
            }
        },
        copy: {
            favicon: {
                expand: true,
                flatten: true,
                src: ['client/img/apple-touch-icon-precomposed.png', 'client/img/favicon.ico'],
                dest: 'public/'
            },
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/modernizr/modernizr.js'],
                dest: 'public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    'bower_components/font-awesome/fonts/*',
                    'client/fonts/*'
                ],
                dest: 'public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'client/img',
                src: ['**'],
                dest: 'public/img/'
            },
            dropzone: {
                expand: true,
                flatten: true,
                cwd: 'bower_components',
                src: ['dropzone/**/*.png'],
                dest: 'public/img/'
            },
            chosen: {
                expand: true,
                flatten: true,
                src: ['bower_components/chosen/public/*.png'],
                dest: 'public/img/'
            },
            select2: {
                expand: true,
                flatten: true,
                src: ['bower_components/select2/*.png', 'bower_components/select2/*.gif'],
                dest: 'public/css/' // FIXME: this is not css
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
                dest: 'server/locale/templates/LC_MESSAGES/messages.pot'
            },
            jade: {
                src: 'server/views/**/*.jade',
                dest: 'server/locale/templates/LC_MESSAGES/messages.pot',
                options: {
                    language: 'jade',
                    keyword: '__'
                }
            }
        },
        abideMerge: {
            messages: {
                options: {
                    template: 'server/locale/templates/LC_MESSAGES/messages.pot',
                    localeDir: 'server/locale'
                }
            }
        },
        abideCompile: {
            json: {
                dest: 'public/js/',
                options: {
                    type: 'json',
                    localeDir: 'server/locale'
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
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', ['jshint', 'sass', 'coffee', 'concat', 'copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('locales', ['abideExtract', 'abideMerge']);
};
