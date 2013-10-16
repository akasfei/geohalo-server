/* jshint node: true */

module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    target: '../../public',
    banner: '/**\n' +
              '* <%= pkg.name %> v<%= pkg.version %>\n' +
              '* Web-Essentials development package by <%= pkg.author %>\n' +
              '*/\n',
    jqueryCheck: 'if (!jQuery) { throw new Error(\"jQuery is required\") }\n\n',

    assemble: {
      // Task-level options
      options: {
        prettify: {indent: 2},
        marked: {sanitize: false},
        production: grunt.file.readJSON('package.json').production,
        data: 'src/data/*.{json,yml}',
        helpers: 'src/helpers/helper-*.js',
        layout: 'src/layouts/h5.hbs',
        partials: ['src/includes/**/*.hbs'],
      },
      site: {
        // Target-level options
        files: [
          { expand: true, cwd: 'src/pages', src: ['*.hbs'], dest: '<%= target %>/' }
        ]
      }
    },

    // Before generating any new files,
    // remove any previously-created files.
    clean: {
      dist: ['dist']
    },

    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['js/application.js', 'js/app-*.js']
      },
      lib: {
        src: ['lib/js/*.js']
      }
    },

    concat: {
      options: {
        banner: '<%= banner %><%= jqueryCheck %>',
        stripBanners: false
      },
      bootstrap: {
        src: [
          'lib/js/transition.js',
          'lib/js/alert.js',
          'lib/js/button.js',
          'lib/js/carousel.js',
          'lib/js/collapse.js',
          'lib/js/dropdown.js',
          'lib/js/modal.js',
          'lib/js/tooltip.js',
          'lib/js/popover.js',
          'lib/js/scrollspy.js',
          'lib/js/tab.js',
          'lib/js/affix.js'
        ],
        dest: '<%= target %>/js/bootstrap.js'
      }
    },

    uglify: {
      bootstrap: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          '<%= target %>/js/bootstrap.min.js': '<%= concat.bootstrap.dest %>'
        }
      },
      application: {
        files: {
          '<%= target %>/js/application.min.js': '<%= jshint.src.src %>'
        }
      }
    },

    less: {
      options: {
        compile: true
      },
      bootstrap: {
        files: {
          '<%= target %>/css/bootstrap.css' : 'lib/less/bootstrap.less'
        }
      },
      bs_min: {
        options: {
          yuicompress: true
        },
        files: {
          '<%= target %>/css/bootstrap.min.css' : 'lib/less/bootstrap.less',
        }
      },
      style: {
        files: {
          '<%= target %>/css/style.css' : 'less/style.less'
        }
      },
      style_min: {
        options: {
          yuicompress: true
        },
        files: {
          '<%= target %>/css/style.min.css' : 'less/style.less'
        }
      }
    },

    copy: {
      bs_fonts: {
        expand: true,
        cwd: 'lib/fonts',
        src: '**',
        dest: '<%= target %>/fonts'
      },
      assets: {
        expand: true,
        cwd: 'assets',
        src: '**',
        dest: '<%= target %>/assets'
      },
      js: {
        expand: true,
        cwd: 'js',
        src: '**',
        dest: '<%= target %>/js'
      },
    },

    watch: {
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'copy:js', 'uglify:application']
      },
      less: {
        files: ['less/*.less', 'lib/less/*.less'],
        tasks: ['less']
      },
      assemble: {
        files: 'src/**/*.hbs',
        tasks: ['assemble']
      },
      assets: {
        files: 'assets/**',
        tasks: ['copy:assets']
      }
    }
  });

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['less', 'concat', 'uglify']);

  grunt.registerTask('default', ['clean', 'jshint', 'build', 'copy', 'assemble']);

  grunt.registerTask('dev', ['default', 'watch']);

  grunt.registerTask('test', ['default']); // Add other framework tasks when they are available
};