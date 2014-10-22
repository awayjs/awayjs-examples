
var concat = require('gulp-concat');
var gulp = require('gulp');
var changed = require('gulp-changed');
var glob = require('glob');
var path = require('path');
var browserify  = require('browserify');
var source = require('vinyl-source-stream');
var map = require('vinyl-map');
var exorcist = require('exorcist');
var sourcemaps = require('gulp-sourcemaps');

var typescript = require('gulp-typescript');
var argv = require('yargs').argv;

gulp.task('compile', function() {
    var tsProject = typescript.createProject({
        declarationFiles: true,
        noExternalResolve: true,
        target: 'ES5',
        module: 'commonjs',
        sourceRoot: './src'
    });

    console.log('./src/' + argv.file + '.ts');
    var tsResult = gulp.src(['./src/' + argv.file + '.ts', './node_modules/awayjs-**/build/*.d.ts'])
        //.pipe(changed('./tests', {extension:'.js', hasChanged: changed.compareLastModifiedTime}))
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write({sourceRoot: './'}))
        .pipe(gulp.dest('./src'));
});

gulp.task('watch', ['package', 'tests'], function() {
    gulp.watch('./lib/**/*.ts', ['package']);
    gulp.watch('./tests/**/*.ts', ['tests']);
});

gulp.task('package', ['compile'], function(){
    var b = browserify({
        debug: true,
        entries: './src/' + argv.file + '.js'
    });

    return b.bundle()
        .pipe(exorcist('./bin/js/' + argv.file + '.js.map'))
        .pipe(source(argv.file + '.js'))
        .pipe(gulp.dest('./bin/js/'));
});

gulp.task('test', function () {

    var tsProject = typescript.createProject({
        declarationFiles: true,
        noExternalResolve: false,
        target: 'ES5',
        module: 'commonjs',
        sourceRoot: '../../../'
    });

    console.log('./src/' + argv.file + '.ts');
    var tsResult = gulp.src(['./src/' + argv.file + '.ts'])
        //.pipe(changed('./tests', {extension:'.js', hasChanged: changed.compareLastModifiedTime}))
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write({includeContent:false}))
        .pipe(gulp.dest('./tests'));
});