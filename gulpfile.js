const fg = require('fast-glob');
const vfs = require('vinyl-fs'); // already used implicitly by gulp.src previously
const fs = require('fs');
const path = require('path');

let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
let plumber = require('gulp-plumber');
let livereload = require('gulp-livereload');
let sass = require('gulp-sass')(require('sass'));
let path = require('path');

const repoRoot = path.join(__dirname, '/');
const govUkFrontendToolkitRoot = path.join(repoRoot, './node_modules/govuk_frontend_toolkit/stylesheets');
const govUkElementRoot = path.join(repoRoot, './node_modules/govuk-elements-sass/public/sass');

const assetsDirectory = './src/main/public';
const stylesheetsDirectory = `${assetsDirectory}/stylesheets`;

// compile scss files
gulp.task('sass', async function () {
  // Resolve scss files (returns array of paths)
  const patterns = [`${stylesheetsDirectory}/*.scss`];
  const files = await fg(patterns, { onlyFiles: true, dot: true });

  if (!files || files.length === 0) {
    return Promise.resolve();
  }

  // Use vinyl-fs.src(paths, { base }) to create a vinyl stream so gulp-sass works as before
  return vfs.src(files, { base: stylesheetsDirectory, allowEmpty: true })
    .pipe(plumber())
    .pipe(sassPlugin({
      includePaths: [
        govUkFrontendToolkitRoot,
        govUkElementRoot
      ]
    }))
    .pipe(gulp.dest(stylesheetsDirectory))
    .pipe(livereload());
});


// copy js, stylesheets and images from dependencies to frontend's public directory
async function copyFilesByPatterns(patterns, destRoot, { flatten = false, baseDir = null } = {}) {
  const matches = await fg(patterns, { dot: true, onlyFiles: true, followSymbolicLinks: true });
  for (const src of matches) {
    let outPath;
    if (flatten) {
      outPath = path.join(destRoot, path.basename(src));
    } else if (baseDir) {
      const rel = path.relative(baseDir, src);
      outPath = path.join(destRoot, rel);
    } else {
      const rel = path.relative(process.cwd(), src);
      outPath = path.join(destRoot, rel);
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.copyFileSync(src, outPath);
  }
}

gulp.task('copy-files', async function () {
  // 1) Copy specific JS libs (flattened) into assets/js/lib/
  await copyFilesByPatterns([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/jquery-validation/dist/jquery.validate.min.js',
    './node_modules/govuk_frontend_toolkit/javascripts/**/*.js',
    './node_modules/govuk_template_jinja/assets/javascripts/**/*.js'
  ], `${assetsDirectory}/js/lib/`, { flatten: true });

  // 2) Copy src/main/public/js/lib/**/* into assets/javascripts preserving structure relative baseDir
  await copyFilesByPatterns(
    ['src/main/public/js/lib/**/*.js'],
    `${assetsDirectory}/javascripts`,
    { flatten: false, baseDir: path.join(process.cwd(), 'src/main/public/js/lib') }
  );

  // 3) Copy govuk_template_jinja stylesheets into stylesheetsDirectory preserving structure
  await copyFilesByPatterns(
    ['./node_modules/govuk_template_jinja/assets/stylesheets/**/*'],
    `${stylesheetsDirectory}/`,
    { flatten: false, baseDir: path.join(process.cwd(), 'node_modules/govuk_template_jinja/assets/stylesheets') }
  );

  return Promise.resolve();
});

// compile scss files whenever they're changed
gulp.task('watch', function (done) {
  gulp.watch(stylesheetsDirectory + '/**/*.scss', gulp.series('sass'));
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
