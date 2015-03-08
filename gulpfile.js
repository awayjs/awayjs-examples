var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var browserify  = require('browserify');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;
var typescript = require('gulp-typescript');
var watchify = require('watchify');
var package = require('./package.json');
var livereload = require('gulp-livereload');
var tsify = require('tsify');

function _compile(filename, callback) {
    console.log('compile ' + filename);
    var tsProject = typescript.createProject({
        declarationFiles: true,
        noExternalResolve: true,
        target: 'ES5',
        module: 'commonjs',
        sourceRoot: './src'
    });

    var tsResult = gulp.src(['./src/' + filename + '.ts', './node_modules/awayjs-**/build/*.d.ts'])
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
            b.external(file, {expose:unixStylePath(path.relative('./node_modules/', file.slice(0,-3)))});
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
        .pipe(transform(function() {
            return exorcist('./bin/js/' + filename + '.js.map');
        }))
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
            b.require(file, {expose:unixStylePath(path.relative('./node_modules/', file.slice(0,-3)))});
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
        .pipe(sourcemaps.write())
        .pipe(transform(function() {
            return exorcist('./bin/js/awayjs-dist-require.js.map');
        }))
        .pipe(gulp.dest('./bin/js'));
});

gulp.task('watch', ['package-awayjs-watch'], function(){

    //Start live reload server
    livereload.listen();
});

gulp.task('package-awayjs-watch', function(callback){
    var b = browserify({
        debug: true,
        paths: ['../'],
        cache:{},
        packageCache:{},
        fullPaths:true
    });

    glob('./node_modules/awayjs-**/lib/**/*.js', {}, function (error, files) {

        files.forEach(function (file) {
            b.require(file, {expose:unixStylePath(path.relative('./node_modules/', file.slice(0,-3)))});
        });

        b = watchify(b);
        b.on('update', function(){
            bundleShare(b, 'awayjs-dist-require.js');
        });

        bundleShare(b, 'awayjs-dist-require.js')
            .on('end', callback);
    })
});


gulp.task('watch-fast', ['package-awayjs-fast'], function() {
    gulp.watch('./node_modules/awayjs-**/build/**/*.js', ['package-awayjs-fast']);
});

gulp.task('package-awayjs-fast', function(){
    //extract awayjs dependencies from package.json
    var awayjsDependencies = [];
    Object.keys(package.dependencies).forEach(function (key) {
        awayjsDependencies.push('./node_modules/' + key + '/build/' + key + ((argv.min)? '.min.js' : '.js'));
    })

    if (argv.maps)
        return gulp.src(awayjsDependencies)
            .pipe(sourcemaps.init({loadMaps:true}))
            .pipe(concat('awayjs-dist-require.js'))
            .pipe(sourcemaps.write({sourceRoot:'./'}))
            .pipe(transform(function() { return exorcist('./bin/js/awayjs-dist-require.js.map'); }))
            .pipe(gulp.dest('./bin/js/'));

    return gulp.src(awayjsDependencies)
        .pipe(concat('awayjs-dist-require.js'))
        .pipe(gulp.dest('./bin/js/'));
});


//
//
//gulp.task('package-tsify', function(){
//    console.log('package ' + argv.file);
//    var b = browserify({debug: true})
//        .add('./src/' + argv.file + '.ts')
//        .plugin('tsify', { target: 'ES5' });
//
//    return b.bundle()
//        //.pipe(unpathify())
//        .pipe(exorcist('./bin/js/' + argv.file + '.js.map'))
//        .pipe(source(argv.file + '.js'))
//        .pipe(gulp.dest('./bin/js/'));
//});

function bundleShare(b, file) {
    return b.bundle()
        .pipe(source(file))
        .pipe(gulp.dest('./bin/js'))
        .pipe(livereload());
}

function unixStylePath(filePath) {
    return filePath.split(path.sep).join('/');
}