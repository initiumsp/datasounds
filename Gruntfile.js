'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'gh-pages': {
            options: {
                base: 'static',
                branch: 'gh-pages',
                // by default use the method (HTTPS/ SSH) when you clone
                repo: "git@github.com:initiumlab/datasounds.git"
            },
            src: '**/*'
        },

        rsync: {
            options: {
                args: ["--verbose"],
                exclude: [".git*","*.scss","node_modules"],
                recursive: true
            },
            showcase: {
                options: {
                    src: "./static/",
                    dest: "/home/vagrant/web/datasounds/",
                    host: "vagrant@showcase.initiumlab.com",
                    delete: true // Careful this option could cause data loss, read the docs!
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-rsync');

    grunt.registerTask('deploy:prod', ['gh-pages']);
    grunt.registerTask('deploy:staging', ['rsync']);
};
