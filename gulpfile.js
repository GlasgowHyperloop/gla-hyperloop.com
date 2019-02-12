/*
Install these with 'npm i -D <name>' to save dev dependencies in package.json.
*/
var browserSync = require('browser-sync');
var del = require('del');
var filter = require('gulp-filter');
var gulp = require('gulp');
var pug = require('gulp-pug');
var runSequence = require('run-sequence');

var dir = {
  root: './',
  dist: './dist/',
  pages: './pages/',
  pages_all: './pages/**/*.{pug,md}',
  pages_pug: './pages/**/*.pug',
  // styles: './styles/**/*.css',
  styles: './styles/**/*',
  scripts: './scripts/**/*',
};

gulp.task('build_clean', function() {
  return del([
    dir.dist + '**/*',
    '!' + dir.dist + 'fonts/**',
    '!' + dir.dist + 'images/**',
  ]);
});

gulp.task('build_styles', function() {
  return gulp
    .src(dir.styles)
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest(dir.dist + 'styles/'));
});

gulp.task('build_scripts', function() {
  return gulp.src(dir.scripts).pipe(gulp.dest(dir.dist + 'scripts/'));
});

gulp.task('build_pages', function() {
  return (
    gulp
      .src(dir.pages_pug)
      .pipe(pug({ basedir: dir.pages }))
      // .pipe(pug({ basedir: dir.pages, pretty: true }))
      .pipe(
        filter(function(file) {
          return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }),
      )
      .pipe(gulp.dest(dir.dist))
  );
});

gulp.task('build_headers', function() {
  return gulp.src('_headers').pipe(gulp.dest(dir.dist));
});

gulp.task('build', function(done) {
  runSequence(
    'build_clean',
    ['build_styles', 'build_scripts', 'build_headers'],
    'build_pages',
    done,
  );
});

gulp.task('watch', ['build'], function() {
  browserSync({
    server: dir.dist,
    ghostMode: {
      scroll: true,
    },
    snippetOptions: {
      ignorePaths: '',
    },
    rewriteRules: [
      {
        match: "script-src 'self';",
        replace:
          "script-src 'self' '" +
          'sha256-7+J4BBpfP6BrGwq4jUTZH0MyBpT74yWhCBZ2TproeZY=' +
          "'; connect-src ws: 'self';",
      },
    ],
  });
  gulp.watch(dir.styles, ['build_styles']);
  gulp.watch(dir.scripts, ['build_scripts', browserSync.reload]);
  gulp.watch(dir.pages_all, ['build_pages', browserSync.reload]);
});
