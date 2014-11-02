
var concat = require('gulp-concat');
var gulp = require('gulp');
var changed = require('gulp-changed');
var glob = require('glob');
var path = require('path');
var browserify  = require('browserify');
var source = require('vinyl-source-stream');
var map = require('vinyl-map');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var unpathify = require('unpathify');

var typescript = require('gulp-typescript');
var argv = require('yargs').argv;

function _compile(filename) {
    console.log('compile ' + filename);
    var tsProject = typescript.createProject({
        declarationFiles: true,
        noExternalResolve: true,
        target: 'ES5',
        module: 'commonjs',
        sourceRoot: './src'
    });

    var tsResult = gulp.src(['./src/' + filename + '.ts', './node_modules/awayjs-**/build/*.d.ts'])
        //.pipe(changed('./tests', {extension:'.js', hasChanged: changed.compareLastModifiedTime}))
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write({sourceRoot: './'}))
        .pipe(gulp.dest('./src'));
}

function _package(filename) {
    console.log('package ' + filename);
    var b = browserify({
        debug: true,
        entries: './src/' + filename + '.js'
    });

    return b.bundle()
        //.pipe(unpathify())
        .pipe(exorcist('./bin/js/' + filename + '.js.map'))
        .pipe(source(filename + '.js'))
        .pipe(gulp.dest('./bin/js/'));
}

function _minify(filename) {
    console.log('minify ' + filename);
    return gulp.src('./bin/js/' + filename + '.js')
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify({compress:false}))
        .pipe(sourcemaps.write({sourceRoot:'./'}))
        .pipe(transform(function() { return exorcist('./bin/js/' + filename + '.js.map'); }))
        .pipe(gulp.dest('./bin/js/'));
}

gulp.task('compile', function() {
    return _compile(argv.file);
});

gulp.task('package', ['compile'], function(){
    return _package(argv.file);
});

gulp.task('package-min', ['package'], function(callback){
    return _minify(argv.file);
});

gulp.task('package-all', function(){
    glob('./src/*.ts', {}, function (error, files) {

        return files.forEach(function (file) {
            var filename = path.basename(file, '.ts');

            _compile(filename)
                .on('end', function() {
                _package(filename)
                    .on('end', function() {
                        _minify(filename);
                    })
            });
        });
    });
})