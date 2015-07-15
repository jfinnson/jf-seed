"use strict";

var util = require("util");

var lrSnippet = require("grunt-contrib-livereload/lib/utils").livereloadSnippet;


module.exports = function (grunt) {
    // load all grunt tasks
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner:
          '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
          ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; */',
          
        dirs: {
          staging: {
            root: '.tmp',
            marketplace: '<%= dirs.staging.root %>/marketplace'
          },
          dist: {
            root: 'dist',
            marketplace: '<%= dirs.dist.root %>/marketplace'
          },
          app: {
            root: 'app'
          },
          jslib: {
            root: 'app/lib',
            bower: '<%= dirs.jslib.root %>/bower_components'
          }
        },
        ngconstant: {
          options: {
            name: 'Sowingo.Config',
            dest: 'src/js/config.js',
            constants: grunt.file.readJSON('config/constants.json')
          },
          dist: {
            constants: getOverrides()
          }
        },
        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= dirs.staging.marketplace %>',
              src: ['app/scripts/main.js'],
              dest: '<%= dirs.staging.marketplace %>'
            }]
          }
        },
        
        
        cdnify: {
            dist: {
                html: ["dist/*.html"]
            }
        },
        clean: {
          staging: {
            files: [{
              dot: true,
              src: '<%= dirs.staging.root %>'
            }]
          },
          dist: {
            files: [{
              dot: true,
              cwd: '<%= dirs.dist.root %>',
              src: ['marketplace/**/*']
            }]
          }
        },
        concat: {
            //Concat into app/ so that all lib files can be used without being referenced in index.html
            dev_lib: {
              files: [{
                // Marketplace JS Libs
                dest: '<%= dirs.app.root %>/scripts/lib.js',
                src: [
                  '<%= dirs.jslib.bower %>/jquery/dist/jquery.js',
                  '<%= dirs.jslib.bower %>/angular/angular.js',
                  '<%= dirs.jslib.bower %>/angular-route/angular-route.js',
                  '<%= dirs.jslib.bower %>/angular-ui-grid/ui-grid.js',
                  '<%= dirs.jslib.bower %>/angular-bootstrap/ui-bootstrap-tpls.min.js',
                  '<%= dirs.jslib.bower %>/angular-ui-utils/ui-utils.min.js',
                  '<%= dirs.jslib.bower %>/angular-bootstrap-show-errors/src/showErrors.min.js',
                  '<%= dirs.jslib.bower %>/underscore/underscore.js',
                  '<%= dirs.jslib.root %>/toaster/toaster.js',
                ]
              }]
            },
            //Concat into app/ so that all src and template files can be used without being referenced in index.html
            dev_app: {
              files: [{
                dest: '<%= dirs.app.root %>/scripts/main.js',
                src: [
                  'app/scripts/globals.js',
                  'app/scripts/config.js',
                  'app/scripts/{shared,marketplace}/**/index.js',
                  'app/scripts/{shared,marketplace}/**/*.js'
                ]
              },{
                dest: '<%= dirs.app.root %>/scripts/templates.js',
                src: [
                  'app/templates/generated/*.js'
                ]
              }]
            }
        },
        connect: {
            dev: {
                options: {
                    port: 8001,
                    hostname: "0.0.0.0",
                    middleware: function (connect, options) {
                        return [
                            lrSnippet,
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    },
                    keepalive: true
                }
            },
            dist: {
                options: {
                    port: 8001,
                    hostname: "0.0.0.0",
                    middleware: function (connect, options) {
                        return [
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    },
                    keepalive: true
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: "app",
                        dest: "dist",
                        src: [
                            "*.{ico,txt}",
                            ".htaccess",
                            "pages/**",
                            "styles/shared/fonts/**",
                            "styles/marketplace/images/**"
                        ]
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: {
                    "dist/styles/main.css": [
                        "app/styles/*.css"
                    ]
                }
            }
        },
        html2js: {
          options: {
            base: 'app/templates',
            singleModule: true,
            // Note: This helps minify because we use double-quotes for
            // HTML attributes, so every one of those will need to be
            // escaped (adding an extra char) if we use the default
            // double-quotes for quoteChar.
            quoteChar: '\'',
            htmlmin: {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true
            }
          },
          templates: {
            options: {
              module: 'Sowingo.Marketplace.Templates'
            },
            files: [{
              dest: '<%= dirs.staging.marketplace %>/js/templates.js',
              src: [
                'app/templates/marketplace/**/*.html',
                'app/templates/shared/**/*.html',
              ]
            }]
          }
        },
        htmlmin: {
            dist: {
                options: {
                  collapseWhitespace: true,
                  conservativeCollapse: true,
                  collapseBooleanAttributes: true,
                  removeCommentsFromCDATA: true,
                  removeOptionalTags: true
                },
                files: [
                    {
                        expand: true,
                        cwd: "app",
                        src: "*.html",
                        dest: "dist"
                    }
                ]
            }
        },
        imagemin: {
            dist: {
                files: [
                     {
                        expand: true,
                        cwd: "app/styles/shared/images",
                        src: "*.{png,jpg,jpeg}",
                        dest: "dist/styles/images"
                    },
                    {
                        expand: true,
                        cwd: "app/styles/marketplace/images",
                        src: "*.{png,jpg,jpeg}",
                        dest: "dist/styles/images"
                    }
                ]
            }
        },
        jshint: {
            options: {
                jshintrc: ".jshintrc",
                reporter: require('jshint-stylish')
            },
            all: [
                "Gruntfile.js",
                "app/scripts/**/*.js",
                "test/**/*.js",
                "!test/lib/*.js"
            ]
        },
        karma: {
            options: {
                browsers: ["Firefox"]  //PhantomJS will work in next karma release
            },
            unit: {
                configFile: "karmaUnit.conf.js"
            },
            unitCi: {
                configFile: "karmaUnit.conf.js",
                singleRun: true
            },
            e2e: {
                configFile: "karmaE2E.conf.js"
            },
            e2eCi: {
                configFile: "karmaE2E.conf.js",
                singleRun: true
            }
        },
        less: {
            all: {
                options: {
                  banner: '<%= banner %>',
                  compile: true
                },
                files: {
                    "app/styles/main.css": "app/styles/main.less"
                }
            }
        },
        preprocess: {
            dev: {
                options: {
                    context: {
                        DEV: true
                    }
                },
                src: "app/indexTemplate.html",
                dest: "app/index.html"
            },
            dist: {
                src: "app/indexTemplate.html",
                dest: "app/index.html"
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                ascii_only: true
            },
            dist: {
                files: {
                    "dist/scripts/libraries.min.js": ["<%= dirs.app.root %>/scripts/libraries.js"],
                    ,"dist/scripts/templates.min.js": ["<%= dirs.app.root %>/scripts/templates.js"],
                    "dist/scripts/main.min.js": ["<%= dirs.app.root %>/scripts/main.js"]
                }
            }
        },
        useminPrepare: {
            html: "app/index.html",
            options: {
                dest: "dist"
            }
        },
        usemin: {
            html: ["dist/*.html"],
            css: ["dist/styles/*.css"],
            options: {
                dirs: ["dist"]
            }
        },
        watch: {
            server: {
                files: [
                    "app/indexTemplate.html",
                    "app/templates/**/*.html",
                    "app/pages/**/*.html",
                    "app/scripts/**/*.js",
                    "app/styles/**/*.less",
                    "app/styles/**/*.{png,jpg,jpeg}"
                ],
                tasks: ["less", "html2js:templates", "preprocess:dev", "jshint", "livereload"]
            }
        }
    });
    
    grunt.renameTask("regarde", "watch");

    // template compilation
    var TEMPLATE = "angular.module('%s').run(['$templateCache', function($templateCache) {\n" +
        "  $templateCache.put('%s',\n    '%s');\n" +
        "}]);\n";

    var escapeContent = function (content) {
        return content.replace(/'/g, "\\'").replace(/\r?\n/g, "\\n' +\n    '");
    };

    grunt.registerTask("install", "install the frontend dependencies and karma-cucumber", function () {
        var exec = require("child_process").exec;
        var cb = this.async();
        exec("bower install --dev", {}, function (err, stdout) {
            console.log(stdout);
            cb();
        });
    });

    grunt.registerMultiTask("html2js", "Generate js version of html template.", function () {
        /* jshint camelcase: false */
        var files = grunt._watch_changed_files || grunt.file.expand(this.data); //

        files.forEach(function (file) {
            var content = escapeContent(grunt.file.read(file));
            var fileName = file.substr(4, file.length);  
            var template = util.format(TEMPLATE, "app", fileName, content);

            var slashIndex = file.lastIndexOf("/");

            //put the file in app/templates/generated and append .js
            file = "app/templates/generated" + file.substr(slashIndex) + ".js";
            grunt.file.write(file, template);
        });
    });

    grunt.registerTask("server", function (target) {
        var tasks = [
            "preprocess:dev",
            "less",
            "html2js:templates",
            "jshint",
            "connect:dev"
        ];

        if (target !== "noreload") {
            tasks.push("livereload-start");
        }

        if (target === "dist") {
            return grunt.task.run(["connect:dist:keepalive"]);
        } else if (target === "testUnit") {
            tasks.push("karma:unit");
        } else if (target === "testE2E") {
            tasks.push("karma:e2e");
        } else {
            tasks.push("watch:server");
        }

        grunt.task.run(tasks);
    });

    grunt.registerTask("ci", function (target) {
        var tasks = [
            "preprocess:dev",
            "less",
            "html2js:templates",
            "jshint",
            "connect:dev"
        ];

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

    grunt.registerTask("build", [
        "ci",
        "clean:dist",
        "preprocess:dist",
        "less",
        "html2js:templates",
//        "jshint", //redundant
        "useminPrepare",
        "imagemin",
        "cssmin",
        "htmlmin",
        "concat",
        "concat:dev_lib",
        "concat:dev_app",
        'ngAnnotate',
        "copy",
        "cdnify",
        "uglify:dist",
        "usemin"
    ]);
 

    grunt.registerTask("default", ["build"]);
};