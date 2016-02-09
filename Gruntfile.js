'use strict';

let path = require('path');
let fs = require('fs');

let timeStamp = generateTimeStamp();
let devStamp = 'temp';

function generateTimeStamp() {
  let date = new Date();
  let year = date.getFullYear().toString();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  let timeStamp = year.toString() +
    (month < 10 ? '0' : '') +
    month.toString() +
    (day < 10 ? '0' : '') +
    day.toString() +
    (hour < 10 ? '0' : '') +
    hour.toString() +
    (minute < 10 ? '0' : '') +
    minute.toString() +
    (second < 10 ? '0' : '') +
    second.toString();

  return timeStamp;
}

//
// Create the dictionary of files to build through Browserify.
// The pathVal param lets us choose to build for cache-busting in the public path,
// or to pass along a fixed string, such as 'temp', for developer builds.
//
// Note that the SOURCE for the build is public/src, not the copied JavaScript files.
// We work against public/src so that the browserify:watch task will work for
// developers modifying public/src JavaScript as part of their development workflow.
// At some point we may update the build process to avoid copying the JavaScript files,
// since they're only fodder for the Browserified output.
//
// Note: If the build process ever involves doing processing, such as template filling,
// on public/src files before they're copied to public/${pathVal}, with Browserify
// necessarily building against the copied files, then our browserify:watch scheme
// will break.
//
function buildBuildFiles(pathVal) {
  return {
    [`public/${pathVal}/scripts/es5scripts.js`]: `public/src/scripts/**/*.js`
  };
}
let buildFiles = buildBuildFiles(timeStamp);
let devbuildFiles = buildBuildFiles(devStamp);
let uglifiedSrc = `public/${timeStamp}/scripts/es5scripts.js`;
let uglifiedDest = uglifiedSrc;


module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  let deletePathsForPublic = [];

  function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  }

  function buildDeletePathsForPublic() {
    var exceptionDir = 'src';

    // Get all the directories under public
    deletePathsForPublic = getDirectories('public');

    // Eliminate the public/src directory from the array. We don't want that deleted
    var index = deletePathsForPublic.indexOf(exceptionDir);
    deletePathsForPublic.splice(index, 1);

    // Update the array such that the relative paths are constructed against public/
    for (var i = 0; i < deletePathsForPublic.length; i++) {
      deletePathsForPublic[i] = 'public/' + deletePathsForPublic[i] + '/';
    }
  }
  buildDeletePathsForPublic();

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    simplemocha: {
      options: {
        reporter: 'list'
      },
      server: {
        src: [
          'test/*.js',
          'test/*/*.js'
        ]
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        }
      },
      buildFiles: {
        files: buildFiles
      },
      devbuildFiles: {
        files: devbuildFiles
      },
      // Watch makes sense only for dev builds
      watch: {
        files: devbuildFiles,
        options: {
          keepAlive: true,
          watch: true
        }
      }
    },

    copy: {
      public: {
        expand: true,
        cwd: 'public/src/',
        src: ['**'],
        dest: 'public/' + timeStamp + '/'
      },
      devpublic: {
        expand: true,
        cwd: 'public/src/',
        src: ['**'],
        dest: 'public/' + devStamp + '/'
      }
    },

    clean: {
      public: deletePathsForPublic,
      timestamp: ['timestamp.txt'],
      version: ['version.txt']
    },

    jshint: {
      server: ['server/**/*.js'],
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

  grunt.registerTask('gentimestamp', 'Generate a timestamp file', function(pathVal) {
    fs.writeFileSync('timestamp.txt', pathVal + '\n');
  });

  grunt.registerTask('genversion', 'Generate a version file', function() {
    let sourceVersion = process.env.SOURCE_VERSION;
    if (!sourceVersion) {
      sourceVersion = 'undefined';
    }
    fs.writeFileSync('version.txt', sourceVersion + '\n');
  });

  grunt.registerTask('webServer', 'Run the web server', function() {
    let done = this.async();
    let childProcess = require('child_process');
    let webWorker = childProcess.spawn('node', ['webWorker.js']);
    webWorker.stdout.pipe(process.stdout);
    webWorker.stderr.pipe(process.stderr);

    // Never call done() as this task should be terminated with ctrl-c
  });

  grunt.registerTask('start-nginx', 'Start the Nginx proxy server', function() {
    let done = this.async();
    cleanCache();

    let childProcess = require('child_process');
    let nginxWorker = childProcess.spawn('nginx/bin/start-nginx');
    nginxWorker.stdout.pipe(process.stdout);
    nginxWorker.stderr.pipe(process.stderr);
    // Never call done() as this task should be terminated with ctrl-c
  });

  grunt.registerTask('stop-nginx', 'Stop the Nginx proxy server', function() {
    let done = this.async();
    let childProcess = require('child_process');
    let nginxWorker = childProcess.spawn('nginx/bin/stop-nginx');
    nginxWorker.stdout.pipe(process.stdout);
    nginxWorker.stderr.pipe(process.stderr);

    // Never call done() as this task should be terminated with ctrl-c
  });

  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('web', ['webServer']);
  grunt.registerTask('build', ['clean', 'gentimestamp:' + timeStamp, 'genversion', 'copy:public', 'browserify:buildFiles', 'jshint:server', 'jshint:client', 'uglify:production']);
  grunt.registerTask('devbuild', ['clean', 'gentimestamp:' + devStamp, 'genversion', 'copy:devpublic', 'browserify:devbuildFiles', 'jshint:server', 'jshint:client']);
  grunt.registerTask('watch', ['browserify:watch']);

  grunt.registerTask('default', function() {
    grunt.log.writeln('grunt commands this project supports:');
    grunt.log.writeln('');
    grunt.log.writeln('  grunt test (run unit tests)');
    grunt.log.writeln('  grunt build (build for cache-busting with timestamp in public path)');
    grunt.log.writeln('  grunt devbuild (build with \"' + devStamp + '\" in public path)');
    grunt.log.writeln('  grunt clean (clean cache-busting static tree and timestamp.txt file)');
    grunt.log.writeln('  grunt web (start the web server - terminate with ctrl-c)');
    grunt.log.writeln('  grunt start-nginx (start the nginx proxy - terminate with ctrl-c)');
    grunt.log.writeln('  grunt stop-nginx (stop the nginx proxy - same as ctrl-c)');
  });
};

// Clean the Nginx cache.
function cleanCache() {
  let cacheFolder = path.join(__dirname, 'nginx/cache');
  let files = [];
  try {
    files = fs.readdirSync(cacheFolder);
  }
  catch(e) {
    if (e.code !== 'EOENT') {
      throw e;
    }
  }

  files.map((cachedFile) => fs.unlinkSync(path.join(cacheFolder, cachedFile)));
}
