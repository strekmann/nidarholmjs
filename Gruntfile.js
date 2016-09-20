module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            build: {
                dest: 'dist/public/js/site.js',
                src: ['src/client/js/index.js'],
                options: {
                    alias: ['./src/client/js/index.js:s7n']
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
                    '/tmp/styles.css': 'src/client/scss/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: [
                    'src/client/vendor/css/**/*.css',
                    'bower_components/pickadate/lib/themes/default.css',
                    'bower_components/pickadate/lib/themes/default.date.css',
                    'bower_components/pickadate/lib/themes/default.time.css',
                    'bower_components/select2/select2.css',
                    'bower_components/dropzone/dist/dropzone.css',
                    'bower_components/simplemde/dist/simplemde.min.css',
                    '/tmp/styles.css'
                ],
                dest: 'dist/public/css/site.css'
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
                    'bower_components/chosen/chosen.jquery.min.js',
                    'src/client/vendor/js/*.js',
                    'bower_components/dropzone/dist/dropzone.js'
                ],
                dest: 'dist/public/js/vendor.js'
            }
        },
        copy: {
            favicon: {
                expand: true,
                flatten: true,
                src: ['src/client/img/apple-touch-icon-precomposed.png', 'src/client/img/favicon.ico'],
                dest: 'dist/public/'
            },
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/modernizr/modernizr.js'],
                dest: 'dist/public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    'bower_components/font-awesome/fonts/*',
                    'src/client/fonts/*'
                ],
                dest: 'dist/public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'src/client/img',
                src: ['**'],
                dest: 'dist/public/img/'
            },
            dropzone: {
                expand: true,
                flatten: true,
                cwd: 'bower_components',
                src: ['dropzone/**/*.png'],
                dest: 'dist/public/img/'
            },
            chosen: {
                expand: true,
                flatten: true,
                src: ['bower_components/chosen/*.png'],
                dest: 'dist/public/img/'
            },
            select2: {
                expand: true,
                flatten: true,
                src: ['bower_components/select2/*.png', 'bower_components/select2/*.gif'],
                dest: 'dist/public/css/' // FIXME: this is not css
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'dist/public/js/vendor.js': ['dist/public/js/vendor.js']
                }
            },
            client: {
                files: {
                    'dist/public/js/site.js': ['dist/public/js/site.js']
                }
            }
        },
        watch: {
            clientjs: {
                files: ['src/client/js/**/*.js'],
                tasks: ['browserify']
            },
            scss: {
                files: ['src/client/scss/**/*.scss'],
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
                src: 'src/server/**/*.js',
                dest: 'src/server/locale/templates/LC_MESSAGES/messages.pot'
            },
            jade: {
                src: 'src/server/views/**/*.jade',
                dest: 'src/server/locale/templates/LC_MESSAGES/messages.pot',
                options: {
                    language: 'jade',
                    keyword: '__'
                }
            }
        },
        abideMerge: {
            messages: {
                options: {
                    template: 'src/server/locale/templates/LC_MESSAGES/messages.pot',
                    localeDir: 'src/server/locale'
                }
            }
        },
        abideCompile: {
            json: {
                dest: 'dist/public/js/',
                options: {
                    type: 'json',
                    localeDir: 'src/server/locale'
                }
            }
        }
    });

    //grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-i18n-abide');

    grunt.registerTask('default', ['sass', 'concat', 'copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('locales', ['abideExtract', 'abideMerge']);
};
