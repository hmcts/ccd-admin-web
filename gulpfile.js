let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
let plumber = require('gulp-plumber');
let livereload = require('gulp-livereload');
let sass = require('gulp-sass')(require('sass'));
let path = require('path');

const repoRoot = path.join(__dirname, '/');
const govUkElementRoot = path.join(repoRoot, './node_modules/govuk-frontend/sass');

const assetsDirectory = './src/main/public';
const stylesheetsDirectory = `${assetsDirectory}/stylesheets`;

// compile scss files
gulp.task('sass', (done) => {
  gulp.src(stylesheetsDirectory + '/*.scss')
    .pipe(sass({
      includePaths: [
        govUkElementRoot
      ]
    }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(stylesheetsDirectory))
    .pipe(livereload());
  done();
});

// copy js, stylesheets and images from dependencies to frontend's public directory
gulp.task('copy-files', (done) => {
  gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/jquery-validation/dist/jquery.validate.min.js',
    './node_modules/govuk-frontend/**/*.js'
  ])
    .pipe(gulp.dest(`${assetsDirectory}/js/lib/`));

  gulp.src(['src/main/public/js/lib/**/*.js']).pipe(gulp.dest(`${assetsDirectory}/javascripts`));

  gulp.src([
    './node_modules/govuk-frontend/sass'
  ])
    .pipe(gulp.dest(`${stylesheetsDirectory}/`));
  done();
});

// compile scss files whenever they're changed
gulp.task('watch', (done) => {
  gulp.watch(stylesheetsDirectory + '/**/*.scss', ['sass']);
  done();
});

// start the application and watch for file changes (in which case it will be restarted)
gulp.task('develop', (done) => {
  setTimeout(() => {
    livereload.listen();
    nodemon({
      ext: 'ts js njk po html',
      stdout: true
    }).on('start', () => {
      livereload.changed(__dirname);
    });
  }, 500);
  done();
});

gulp.task('default', gulp.series(
  'sass',
  'copy-files',
  'develop',
  'watch'
));
