'use strict';

/**
 *  Welcome to your gulpfile!
 */
var path = require('path');
var gulp = require('gulp');
var inject = require('gulp-inject');
var electron = require('electron');
var gulpsync = require('gulp-sync')(gulp);

var wiredep = require('wiredep').stream;
var gulpLoadPlugins = require('gulp-load-plugins');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var $ = gulpLoadPlugins();
var reload = browserSync.reload;

/*-------------------------------------------------
        DECLARATION of TASKS
---------------------------------------------------*/
gulp.task('default', ['clean'], function ( done ) {
    console.log('default task - clean');
    done();
});
/*-------------------------------------------------
        run electron
---------------------------------------------------*/
var child, timeblock = false;
function restartElectron () {
    if (!timeblock) {
        timeblock = true;
        setTimeout(function () {
            child && child.kill('SIGTERM');
            child = require('child_process').spawn(electron, ['app'], { stdio: 'inherit'});
            timeblock = false;
        }, 3*1000);
    }
}
gulp.task('run', ['start-inject'], function() {
    restartElectron();
    gulp.start('watch');
});
gulp.task('start-inject', gulpsync.async([['inject-scripts', 'inject-bower'], ['inject-styles']]));
/*-------------------------------------------------
    "del": "^2.2.2",
---------------------------------------------------*/
gulp.task('clean', function() {
    return (require('del'))(['dist.prod/', '.tmp/']);
});
/*-------------------------------------------------
    watch all preprocessing files
---------------------------------------------------*/
gulp.task('watch', function ( done ) {
    /*-------------------------------------------------
        When source is changed
    ---------------------------------------------------*/
    gulp.watch('app/images/**/*.*', restartElectron);
    gulp.watch('app/fonts/**/*.*', restartElectron);
    gulp.watch('app/css/**/*.*', ['inject-styles'], restartElectron);
    gulp.watch('app/**/*.js', ['inject-scripts'], restartElectron);
    gulp.watch('app/**/*.html', restartElectron);
    gulp.watch('bower.json', ['inject-bower'], restartElectron);
});
/*-------------------------------------------------
    INJECT
---------------------------------------------------*/
// "wiredep": "^4.0.0",
gulp.task('inject-bower', function() {
    return gulp.src('app/index.html')
        .pipe((require('wiredep')).stream({}))
        .pipe(gulp.dest('app'));
});
// "gulp-inject": "^4.1.0"
// "gulp-angular-filesort": "^1.1.1"
gulp.task('inject-scripts', [], function() {
    return gulp.src('app/index.html')
        .pipe(inject(angularFilesort(), {addRootSlash: false,addPrefix: '..'}))
        .pipe(gulp.dest(path.dirname('app/index.html')));
});
function angularFilesort () {
    // before inject sortin by angular rules
    return gulp.src('app/**/*.js')
        .pipe( (require('gulp-angular-filesort'))() )
        .on('error', function ( error ) {
            console.log( 'ERROR:[ Angular-Filesort ]', String(error) );
            this.emit('end');
        });
}
// "gulp-inject": "^4.1.0"
gulp.task('inject-styles', function () {
    return gulp.src('app/index.html')
        .pipe( inject( gulp.src('app/css/**/*.css'),
            {addRootSlash: false, addPrefix: '..'}
        ))
        .pipe( gulp.dest(path.dirname('app/index.html')) );
});

/* ----------------------------- GULP SERVE ------------------------- */
var dev = true;

gulp.task('wiredep', function() {
  gulp.src('app/css/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/css'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('styles', function() {
  return gulp.src('app/css/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src('app/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
	.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist.prod/fonts')));
});

gulp.task('serve', function() {
  runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], function() {
    browserSync.init({
      notify: false,
      port: 9033,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      '.tmp/fonts/**/*',
      'app/**/*.js'
    ]).on('change', reload);

    gulp.watch('app/css/**/*.scss', ['styles'], reload);
    gulp.watch('app/scripts/**/*.js', ['scripts'], reload);
    gulp.watch('app/fonts/**/*', ['fonts'], reload);
    gulp.watch('bower.json', ['wiredep', 'fonts'], reload);
  });
});

/*-------------------------------------------------
        
---------------------------------------------------*/
// package imagemin dependencies
// "gulp-imagemin": "^3.0.3"
gulp.task('imagemin', function() {
    return gulp.src('app/images/**/*')
        .pipe((require('gulp-imagemin'))())
        .pipe(gulp.dest('dist.prod/images'));
});
gulp.task('copy-html', function() {
    return gulp.src(['app/**/*.html', '!app/index.html'])
        .pipe(gulp.dest('dist.prod'));
});
gulp.task('copy-fonts', function () {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist.prod/fonts'));
});

gulp.task('copy-js', function() {
    return gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist.prod/js'));
})
gulp.task('copy-locales', function() {
    return gulp.src('app/locales/**/*')
        .pipe(gulp.dest('dist.prod/locales'));
});
// "main-bower-files": "^2.13.1"
// "gulp-filter": "^4.0.0"
gulp.task('bower-fonts', function () {
    return gulp.src( (require('main-bower-files'))() )
        .pipe((require('gulp-filter'))('**/*.{eot,otf,svg,ttf,woff,woff2}'))
        .pipe(gulp.dest('dist.prod/fonts'));
});

gulp.task('main-copy', function () {
    return gulp.src(['app/main.js', 'app/package.json'])
        .pipe( gulp.dest('dist.prod') );
});

gulp.task('assets', gulpsync.async([['clean', 'imagemin', 'copy-js', 'copy-fonts', 'copy-html', 'copy-locales', 'bower-fonts', 'main-copy']]));

// "gulp-useref": "^3.1.2"
// "gulp-if": "^2.0.2"
// "gulp-rev": "^7.1.2"
// "gulp-rev-replace": "^0.4.3"
// "gulp-ng-annotate": "^2.0.0"
// "gulp-uglify": "^2.0.0"
// "gulp-cssnano": "^2.1.2"
// "uglify-save-license": "^0.4.1"
// "gulp-replace": "^0.5.4"
// "gulp-htmlmin": "^3.0.0"
gulp.task('default', ['start-inject', 'assets'], function() {
    var IF = require('gulp-if');
    return gulp.src('app/index.html')
        .pipe( (require('gulp-useref'))() )
        .pipe( IF('app/app.js', (require('gulp-ng-annotate'))()) )
        .pipe( IF('app/app.js', (require('gulp-uglify'))({ preserveComments: require('uglify-save-license') })) )
            // replace font path in css libs like a bootstrap or font-awesome
        .pipe( IF('**/all.css', (require('gulp-replace'))('../fonts/', 'assets/fonts/')) )
        .pipe( IF('*.css', (require('gulp-cssnano'))()) )
        .pipe( IF('!*.html', (require('gulp-rev'))()) )
        .pipe( (require('gulp-rev-replace'))() )
        .pipe( IF('index.html', (require('gulp-htmlmin'))({
            removeEmptyAttributes: true,
            removeAttributeQuotes: false,
            collapseBooleanAttributes: true,
            collapseWhitespace: true
        })) )
        .pipe(gulp.dest('dist.prod/'));
});


/*-------------------------------------------------
    ELECTRIFY
// "electron-packager": "^8.3.0"
---------------------------------------------------*/
gulp.task('electrify-win', ['default'], function () {
    var pkg = require('./app/package.json');
    (require('del')).sync([
        './'+pkg.name+'-win32-ia32',
        './'+pkg.name+'-win32-x64',
        'app/templateCacheHtml.js'
    ]);
    require('electron-packager')( {
        dir: 'dist.prod',
        name: pkg.name,
        'app-version': pkg.version,
        icon: '',
        platform: ['win32'],
        arch: ['ia32', 'x64']
    }, function ( err, src ) {
        console.log('electron-packager-win', arguments);
    });
});

gulp.task('electrify-linux', ['default'], function () {
    var pkg = require('./app/package.json');
    (require('del')).sync([
        './'+pkg.name+'-linux-ia32',
        './'+pkg.name+'-linux-x64',
        './'+pkg.name+'-linux-armv7l',
        'app/templateCacheHtml.js'
    ]);
    require('electron-packager')( {
        dir: 'dist.prod',
        name: pkg.name,
        'app-version': pkg.version,
        icon: '',
        platform: ['linux'],
        arch: ['ia32', 'x64', 'armv7l']
    }, function ( err, src ) {
        console.log('electron-packager-linux', arguments);
    });
});

gulp.task('electrify-mas', ['default'], function () {
    var pkg = require('./app/package.json');
    (require('del')).sync([
        './'+pkg.name+'-mas-ia32',
        './'+pkg.name+'-mas-x64',
        './'+pkg.name+'-mas-armv7l',
        'app/templateCacheHtml.js'
    ]);
    require('electron-packager')( {
        dir: 'dist.prod',
        name: pkg.name,
        'app-version': pkg.version,
        icon: '',
        platform: ['mas'],
        arch: ['ia32', 'x64', 'armv7l']
    }, function ( err, src ) {
        console.log('electron-packager-mas', arguments);
    });
});