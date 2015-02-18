var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var browserify  = require('browserify');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;

var typescript = require('gulp-typescript');

function _compile(filename, callback) {
    console.log('compile ' + filename);
    var tsProject = typescript.createProject({
        declarationFiles: true,
        noExternalResolve: true,
        target: 'ES5',
        module: 'commonjs',
        sourceRoot: './src'
    });

    var tsResult = gulp.src(['./src/' + argv.file + '.ts', './node_modules/awayjs-**/build/*.d.ts'])
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    tsResult.js
        .pipe(sourcemaps.write({sourceRoot: './'}))
        .pipe(gulp.dest('./src'))
        .on('end', callback);
}

function _package(filename, callback) {
    console.log('package ' + filename);
    var b = browserify({
        debug: true,
        entries: './src/' + filename + '.js'
    });

    glob('./node_modules/awayjs-**/lib/**/*.js', {}, function (error, files) {

        files.forEach(function (file) {
            b.external(file, {expose:(path.relative('./node_modules/', file.slice(0,-3))).replace(/\\/gi, "/")});
        });

        b.bundle()
            .pipe(exorcist('./bin/js/' + filename + '.js.map'))
            .pipe(source(filename + '.js'))
            .pipe(gulp.dest('./bin/js'))
            .on('end', callback);
    });
}

function _minify(filename) {
    console.log('minify ' + filename);
    return gulp.src('./bin/js/' + filename + '.js')
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify({compress:false}))
        .pipe(sourcemaps.write({sourceRoot:'./'}))
        .pipe(transform(function() { return exorcist('./bin/js/' + filename + '.js.map'); }))
        .pipe(gulp.dest('./bin/js/'))
}

gulp.task('compile', function(callback) {
    _compile(argv.file, callback);
});

gulp.task('package', ['compile'], function(callback){
    _package(argv.file, callback);
});

gulp.task('package-min', ['package'], function(){
    return _minify(argv.file);
});

gulp.task('package-all', function(){
    glob('./src/*.ts', {}, function (error, files) {

        return files.forEach(function (file, index) {
            var filename = path.basename(file, '.ts');

            _compile(filename, function() {
                    _package(filename, function() {
                        _minify(filename);
                    });
                });
        });
    });
});

gulp.task('package-awayjs', function(callback){
    var b = browserify({
        debug: true,
        paths: ['../']
    });

    glob('./node_modules/awayjs-**/lib/**/*.js', {}, function (error, files) {

        files.forEach(function (file) {
            b.require(file, {expose:(path.relative('./node_modules/', file.slice(0,-3))).replace(/\\/gi, "/")});
        });

        b.bundle()
            .pipe(exorcist('./bin/js/awayjs-dist-require.js.map'))
            .pipe(source('awayjs-dist-require.js'))
            .pipe(gulp.dest('./bin/js'))
            .on('end', callback);
    });
});

gulp.task('package-awayjs-min', ['package-awayjs'], function(callback){
    return gulp.src('./bin/js/awayjs-dist-require.js')
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify({compress:false}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./bin/js'));
});


gulp.task('watch', ['package'], function() {
    gulp.watch('./src/**.ts', ['package']);
});