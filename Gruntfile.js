module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>, version <%= pkg.version %>, copyright by <%= pkg.author %> | <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    drop_console: true
                }
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '**/*.js',
                    dest: 'build',
                    ext: '.min.js'
                }]
            },
            example: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '**/*.js',
                    dest: 'examples',
                    ext: '.min.js'
                }]
            }
        },
        cssmin: {
            project: {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: ['*.css'],
                    dest: 'build',
                    ext: '.min.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                browsers: ["Firefox ESR", "Opera 12", "ff >= 10", "ios >= 5", "ie > 8"],
                silent: true
            },
            multiple_files: {
                src: 'src/css/*.css'
            }
        },
        compass: {
            options: {
                sassDir: 'src/scss/'
            },
            dev: {
                options: {
                    cssDir: 'src/css/',
                    environment: 'development'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false
                }
            },
            scss: {
                files: ['src/**/*.scss'],
                tasks: ['compass:dev','autoprefixer', 'cssmin'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);

};