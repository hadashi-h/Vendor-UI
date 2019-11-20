"use strict";

var gulp = require("gulp");

var browsersync = require("browser-sync").create();
var sourcemaps = require("gulp-sourcemaps");

//for js
var uglify = require("gulp-uglify-es").default;
var gulpIf = require("gulp-if");

//for css 
var gulpSass = require("gulp-sass");
var concat = require("gulp-concat");
var postcss = require('gulp-postcss');
var cssnano = require('cssnano');

//images
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache"); 

var del = require("del");

var argv = require("yargs")
  .default("env", "development")
  .argv;

var taskOptions;
if (argv.env == "production") {
  taskOptions = {
    minify: true,
    sourcemaps: true,
    sync: false
  }
}
else if (argv.env == "development") {
  taskOptions = {
    minify: false,
    sourcemaps: true,
    sync: true
  }
}

const config = {
  src: "./dev/",
  dest: "./dist/"
};

var plugins = [
  cssnano()
];

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: config.dest,
      directory: true,
      middleware: function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
      }
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del([config.dest]);
}

function prepareCss() {
  return gulp
    .src(config.src + "scss/**/*.scss")
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.init()))
    .pipe(gulpSass({ outputStyle: "expanded" }).on("error", gulpSass.logError))
    .pipe(gulpIf(taskOptions.minify, postcss(plugins)))
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.write("maps")))
    .pipe(gulp.dest(config.dest + "css"))
    .pipe(gulpIf(taskOptions.sync, browsersync.stream()));
}

function prepareJs() {
  return gulp
    .src(config.src + "js/**/*.js")
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.init()))
    .pipe(gulpIf(taskOptions.minify, uglify()))
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.write("maps")))
    .pipe(gulp.dest(config.dest + "js"))
    .pipe(gulpIf(taskOptions.sync, browsersync.stream()));
}

function prepareCssLibs() {
  return gulp
    .src([
      "node_modules/bootstrap/dist/css/bootstrap.min.css",
    ])
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.init()))
    .pipe(concat("default-css.css"))
    .pipe(gulpIf(taskOptions.minify, postcss(plugins)))
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.write("maps")))
    .pipe(gulp.dest(config.dest + "css"))
    .pipe(gulpIf(taskOptions.sync, browsersync.stream()));
}

function prepareJsLibs() {
  return gulp
    .src([
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/popper.js/dist/umd/popper.min.js",
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "node_modules/web-animations-js/web-animations.min.js",
      "node_modules/muuri/dist/muuri.min.js"
    ])
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.init()))
    .pipe(concat("default-js.js"))    
    .pipe(gulpIf(taskOptions.minify, uglify()))
    .pipe(gulpIf(taskOptions.sourcemaps, sourcemaps.write("maps")))
    .pipe(gulp.dest(config.dest + "js"))
    .pipe(gulpIf(taskOptions.sync, browsersync.stream()));
}

function copyLibs() {
    return gulp
      .src(config.src + "lib/**/*")
      .pipe(gulp.dest(config.dest + "lib"))
}

function prepareImages() {
  return gulp
  .src(config.src + "img/**/*.+(png|jpg|gif|svg|ico)")
  .pipe(gulpIf(taskOptions.minify, cache(imagemin({ interlaced: true }))))
  .pipe(gulp.dest(config.dest + "img"))
  .pipe(gulpIf(taskOptions.sync, browsersync.stream()));
}

function watchFiles() {
  gulp.watch(config.src + "scss/**/*.scss", prepareCss);
  gulp.watch(config.src + "js/**/*.js", prepareJs);
  gulp.watch(config.src + "img/**/*", prepareImages);
  gulp.watch(config.src + "lib/**/*", copyLibs);
}
 
var build = gulp.series(
              clean, 
              gulp.parallel(prepareCss, prepareJs, prepareCssLibs, prepareJsLibs, copyLibs, prepareImages)
            );
var watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
