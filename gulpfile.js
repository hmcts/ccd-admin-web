let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
let livereload = require('gulp-livereload');
let sass = require('gulp-sass')(require('sass'));
let path = require('path');
let { finished } = require('stream/promises');

const repoRoot = path.join(__dirname, '/');
const govUkFrontendToolkitRoot = path.join(repoRoot, './node_modules/govuk_frontend_toolkit/stylesheets');
const govUkElementRoot = path.join(repoRoot, './node_modules/govuk-elements-sass/public/sass');

const assetsDirectory = './src/main/public';
const stylesheetsDirectory = `${assetsDirectory}/stylesheets`;

// compile scss files
gulp.task('sass', () => {
  return gulp.src(stylesheetsDirectory + '/*.scss')
    .pipe(sass({
      includePaths: [
        govUkFrontendToolkitRoot,
        govUkElementRoot
      ]
    }))
    .pipe(gulp.dest(stylesheetsDirectory))
    .pipe(livereload());
});

// copy js, stylesheets and images from dependencies to frontend's public directory
gulp.task('copy-files', async () => {
  await Promise.all([
    finished(gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/jquery-validation/dist/jquery.validate.min.js',
      './node_modules/govuk_frontend_toolkit/javascripts/**/*.js',
      './node_modules/govuk_template_jinja/assets/javascripts/**/*.js'
    ])
      .pipe(gulp.dest(`${assetsDirectory}/js/lib/`))),

    finished(gulp.src([
      './node_modules/govuk_template_jinja/assets/stylesheets/**/*'
    ])
      .pipe(gulp.dest(`${stylesheetsDirectory}/`)))
  ]);

  await finished(gulp.src(['src/main/public/js/lib/**/*.js'])
    .pipe(gulp.dest(`${assetsDirectory}/javascripts`)));
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
