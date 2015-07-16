"use strict";

var util = require("util");

var lrSnippet = require("grunt-contrib-livereload/lib/utils").livereloadSnippet;

module.exports = function(grunt) {
  // load all grunt tasks
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  var getOverrides = function() {
    return grunt.file.exists('overrides.json') ? grunt.file.readJSON('overrides.json') : {};
  };

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
        + '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; */',

    dirs : {
      staging : {
        root : '.tmp',
        marketplace : '<%= dirs.staging.root %>/marketplace'
      },
      dist : {
        root : 'dist',
        marketplace : '<%= dirs.dist.root %>/marketplace'
      },
      app : {
        root : 'app'
      },
      jslib : {
        root : 'app/lib',
        bower : '<%= dirs.jslib.root %>/bower_components'
      }
    },
    ngconstant : {
      options : {
        name : 'app.Config',
        dest : 'app/scripts/config.js',
        constants : grunt.file.readJSON('config/constants.json')
      },
      dist : {
        constants : getOverrides()
      }
    },
    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate : {
      dist : {
        files : [ {
          expand : true,
          cwd : '<%= dirs.staging.marketplace %>',
          src : [ 'app/scripts/main.js' ],
          dest : '<%= dirs.staging.marketplace %>'
        } ]
      }
    },

    clean : {
      staging : {
        files : [ {
          dot : true,
          src : '<%= dirs.staging.root %>'
        } ]
      },
      dist : {
        files : [ {
          dot : true,
          cwd : '<%= dirs.dist.root %>',
          src : [ 'marketplace/**/*' ]
        } ]
      }
    },
    concat : {
      //Concat into app/ so that all lib files can be used without being referenced in index.html
      dev_lib : {
        files : [ {
          // Marketplace JS Libs
          dest : '<%= dirs.app.root %>/scripts/compiled/libraries.js',
          src : ['<%= dirs.jslib.bower %>/angular-route/angular-route.js', '<%= dirs.jslib.bower %>/angular-ui-grid/ui-grid.js',
              '<%= dirs.jslib.bower %>/angular-bootstrap/ui-bootstrap-tpls.min.js', '<%= dirs.jslib.bower %>/angular-ui-utils/ui-utils.min.js',
              '<%= dirs.jslib.bower %>/angular-bootstrap-show-errors/src/showErrors.min.js', '<%= dirs.jslib.bower %>/underscore/underscore.js',
              '<%= dirs.jslib.root %>/toaster/toaster.js']
        } ]
      },
      //Concat into app/ so that all src and template files can be used without being referenced in index.html
      dev_app : {
        files : [
            {
              dest : '<%= dirs.app.root %>/scripts/compiled/main.js',
              src : [ 'app/scripts/app.js', 'app/scripts/globals.js', 'app/scripts/config.js', 'app/scripts/{shared,marketplace}/**/index.js',
                  'app/scripts/{shared,marketplace}/**/*.js' ]
            }, {
              dest : '<%= dirs.app.root %>/scripts/compiled/templates.js',
              src : [ 'app/templates/generated/*.js' ]
            } ]
      }
    },
    connect : {
      dev : {
        options : {
          port : 8002,
          base: '<%= dirs.app.root %>',
          keepalive : true
        }
      },
      dist : {
        options : {
          port : 8003,
          base: '<%= dirs.dist.root %>',
          keepalive : true
        }
      }
    },
    copy : {
      dist : {
        files : [ {
          expand : true,
          dot : true,
          cwd : "app",
          dest : "dist",
          src : [ "*.{ico,txt}", ".htaccess", "pages/**", "styles/shared/fonts/**", "styles/marketplace/images/**" ]
        } ]
      }
    },
    cssmin : {
      dist : {
        files : {
          "dist/styles/main.css" : [ "app/styles/*.css" ]
        }
      }
    },
    html2js : {
      templates: ["app/templates/**/*.html"]
    },
    htmlmin : {
      dist : {
        options : {
        },
        files : [ {
          expand : true,
          cwd : "app",
          src : ["index.html", "404.html"],
          dest : "dist"
        } ]
      }
    },
    imagemin : {
      dist : {
        files : [ {
          expand : true,
          cwd : "app/styles/shared/images",
          src : "*.{png,jpg,jpeg}",
          dest : "dist/styles/images"
        }, {
          expand : true,
          cwd : "app/styles/marketplace/images",
          src : "*.{png,jpg,jpeg}",
          dest : "dist/styles/images"
        } ]
      }
    },
    jshint : {
      options : {
        jshintrc : ".jshintrc"
      },
      all : [ "app/scripts/marketplace/**/*.js", "app/scripts/shared/**/*.js","app/scripts/app.js" ]
    },
    karma : {
      options : {
        browsers : [ "Firefox" ]
      //PhantomJS will work in next karma release
      },
      unit : {
        configFile : "karmaUnit.conf.js"
      },
      unitCi : {
        configFile : "karmaUnit.conf.js",
        singleRun : true
      },
      e2e : {
        configFile : "karmaE2E.conf.js"
      },
      e2eCi : {
        configFile : "karmaE2E.conf.js",
        singleRun : true
      }
    },
    less : {
      all : {
        options : {
          banner : '<%= banner %>',
          compile : true
        },
        files : {
          "app/styles/main.css" : "app/styles/main.less"
        }
      }
    },
    preprocess : {
      dev : {
        options : {
          context : {
            DEV : true
          }
        },
        src : "app/indexTemplate.html",
        dest : "app/index.html"
      },
      dist : {
        src : "app/indexTemplate.html",
        dest : "app/index.html"
      }
    },
    uglify : {
      options : {
        banner : '<%= banner %>',
        ascii_only : true
      },
      dist : {
        files : {
          "dist/scripts/libraries.min.js" : [ "dist/scripts/libraries.min.js" ],
          "dist/scripts/main.min.js" : [ "dist/scripts/main.min.js" ]
        }
      }
    },
    useminPrepare : {
      html : "app/index.html",
      options : {
        dest : "dist"
      }
    },
    usemin : {
      html : [ "dist/*.html" ],
      css : [ "dist/styles/*.css" ],
      options : {
        dirs : [ "dist" ]
      }
    },
    watch : {
      server : {
        files : [ "app/indexTemplate.html", "app/templates/**/*.html", "app/pages/**/*.html", "app/scripts/**/*.js", "app/styles/**/*.less",
            "app/styles/**/*.{png,jpg,jpeg}" ],
        tasks : [ "concat", "less", "html2js:templates", "preprocess:dev", "jshint", "livereload" ]
      }
    }
  });

  // template compilation
  var TEMPLATE = "angular.module('%s').run(['$templateCache', function($templateCache) {\n" + "  $templateCache.put('%s',\n    '%s');\n" + "}]);\n";

  var escapeContent = function(content) {
    return content.replace(/'/g, "\\'").replace(/\r?\n/g, "\\n' +\n    '");
  };

  grunt.registerTask("install", "install the frontend dependencies and karma-cucumber", function() {
    var exec = require("child_process").exec;
    var cb = this.async();
    exec("bower install --dev", {}, function(err, stdout) {
      console.log(stdout);
      cb();
    });
  });

  grunt.registerMultiTask("html2js", "Generate js version of html template.", function() {
    /* jshint camelcase: false */
    var files = grunt._watch_changed_files || grunt.file.expand(this.data); //

    files.forEach(function(file) {
      var content = escapeContent(grunt.file.read(file));
      var fileName = file.substr(4, file.length);
      var template = util.format(TEMPLATE, "app", fileName, content);

      var slashIndex = file.lastIndexOf("/");

      //put the file in app/templates/generated and append .js
      file = "app/templates/generated" + file.substr(slashIndex) + ".js";
      grunt.file.write(file, template);
    });
  });

  grunt.registerTask("server", function(target) {
    var tasks = [ "preprocess:dist", "less", "html2js:templates", "jshint", "connect:dist" ];

    if (target !== "noreload") {
      tasks.push("livereload-start");
    }

    if (target === "dist") {
      return grunt.task.run([ "connect:dist:keepalive" ]);
    } else if (target === "testUnit") {
      tasks.push("karma:unit");
    } else if (target === "testE2E") {
      tasks.push("karma:e2e");
    } else {
      tasks.push("watch:server");
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask("ci", function(target) {
    var tasks = [ "preprocess:dev", "less", "html2js:templates", "jshint", "connect:dev" ];

    if (!target) {
      //tasks.push("karma:unitCi");
      //            Does not work yet, waiting on next Karma version
      //            tasks.push("karma:e2eCi");
    } else if (target === "unit") {
      tasks.push("karma:unitCi");
    } else if (target === "e2e") {
      tasks.push("karma:e2eCi");
    }

    grunt.task.run(tasks);
  });
  grunt.registerTask("serve", ["livereload-start", "connect:dev" ]);
  grunt.registerTask("testtask", ["preprocess:dist", "less", "html2js:templates", "jshint", 
                                  "ngconstant", "useminPrepare", "imagemin", "cssmin", "htmlmin",
                                  "concat", "concat:dev_lib", "concat:dev_app", 'ngAnnotate', "copy", "uglify:dist", "usemin" ]);

  grunt.registerTask("build", [ "clean:dist", 
                                "preprocess:dist", "less", "html2js:templates", "jshint", 
                                "ngconstant", "useminPrepare", "imagemin", "cssmin", "htmlmin",
                                "concat", "concat:dev_lib", "concat:dev_app", 'ngAnnotate', "copy", "uglify:dist", "usemin" 
                                ]);

  grunt.registerTask("default", [ "build" ]);
};