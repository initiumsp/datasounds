'use strict';

module.exports = function(grunt) {
    'gh-pages': {
        options: {
            base: 'static',
            branch: 'gh-pages'
        },
        src: '**/*'
    }

    grunt.registerTask('deploy:prod', ['gh-pages']);
}
