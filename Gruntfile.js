'use strict';

let uglifiedSrc = `public/src/dist/es5scripts.js`;
let uglifiedDest = uglifiedSrc;

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        }
      },
      buildFiles: {
        files: {[`public/src/dist/es5scripts.js`]: `public/src/scripts/**/*.js`}
      },
      watch: {
        files: {[`public/src/dist/es5scripts.js`]: `public/src/scripts/**/*.js`},
        options: {
          keepAlive: true,
          watch: true
        }
      }
    },

    clean: {
      public: ['public/src/dist']
    },

    jshint: {
      client: ['public/src/scripts/**/*.js'],
      options: {
        jshintrc: true
      }
    },

    uglify: {
      production: {
        files: {
          [uglifiedDest]: [uglifiedSrc]
        }
      }
    }

  });

  grunt.registerTask('build', ['clean', 'jshint:client', 'browserify:buildFiles', 'uglify:production']);
  grunt.registerTask('devbuild', ['clean', 'jshint:client', 'browserify:buildFiles']);
  grunt.registerTask('watch', ['browserify:watch']);

  grunt.registerTask('default', function() {
    grunt.log.writeln('grunt commands this project supports:');
    grunt.log.writeln('');
    grunt.log.writeln('  grunt build (build with uglify compression)');
    grunt.log.writeln('  grunt devbuild (build without compression)');
    grunt.log.writeln('  grunt clean (delete built es5scripts.js file)');
  });
};
