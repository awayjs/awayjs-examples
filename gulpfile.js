var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var browserify  = require('browserify');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var argv = require('yargs').argv;
var watchify = require('watchify');
var package = require('./package.json');
var livereload = require('gulp-livereload');
var tsify = require('tsify');
var watch;

function _package(filename, callback) {
    console.log('package ' + filename);
    var b = browserify({
        debug: true,
        entries: './src/' + filename + '.ts',
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    b.plugin('tsify', {target:'ES5', sourceRoot:'./', noExternalResolve: true, declarationFiles: './node_modules/awayjs-**/build/*.d.ts'});

    glob('./node_modules/awayjs-**/lib/**/*.ts', {}, function (error, files) {
        files.forEach(function (file) {
            b.external(file);
        });

        if (watch) {
            b = watchify(b);
            b.on('update', function(){
                return b.bundle()
                    .pipe(source(filename + '.js'))
                    .pipe(gulp.dest('./bin/js'))
                    .pipe(livereload());
            });
        }

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
        .pipe(transform(function() {
            return exorcist('./bin/js/' + filename + '.js.map');
        }))
        .pipe(gulp.dest('./bin/js/'))
}

gulp.task('package', function(callback){
    watch = false;
    _package(argv.main, callback);
});

gulp.task('package-watch', function(callback){
    watch = true;
    _package(argv.main, callback);
});

gulp.task('package-min', ['package'], function(){
    return _minify(argv.main);
});

gulp.task('package-all', function(){
    glob('./src/*.ts', {}, function (error, files) {

        return files.forEach(function (file, index) {
            var filename = path.basename(file, '.ts');

            _package(filename, function() {
                _minify(filename);
            });
        });
    });
});

gulp.task('watch', ['package-awayjs', 'package-watch'], function() {
    gulp.watch('./node_modules/awayjs-**/build/**/*.js', ['package-awayjs']);

    //Start live reload server
    livereload.listen();
});

gulp.task('package-awayjs', function(){
    //extract awayjs dependencies from package.json
    var awayjsDependencies = [];
    Object.keys(package.dependencies).forEach(function (key) {
        awayjsDependencies.push('./node_modules/' + key + '/build/' + key + ((argv.min)? '.min.js' : '.js'));
    });

    if (argv.maps)
        return gulp.src(awayjsDependencies)
            .pipe(sourcemaps.init({loadMaps:true}))
            .pipe(concat('awayjs-dist-require.js'))
            .pipe(sourcemaps.write({sourceRoot:'./'}))
            .pipe(transform(function() {
                return exorcist('./bin/js/awayjs-dist-require.js.map');
            }))
            .pipe(gulp.dest('./bin/js/'));

    return gulp.src(awayjsDependencies)
        .pipe(concat('awayjs-dist-require.js'))
        .pipe(gulp.dest('./bin/js/'));
});


function unixStylePath(filePath) {
    return filePath.split(path.sep).join('/');
}