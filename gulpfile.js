// gulpfile.js
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const plumber = require('gulp-plumber');
const livereload = require('gulp-livereload');
const sassPlugin = require('gulp-sass')(require('sass'));
const path = require('path');
const fg = require('fast-glob');
const fs = require('fs');
const vfs = require('vinyl-fs');

const repoRoot = path.join(__dirname, '/');
const govUkFrontendToolkitRoot = path.join(repoRoot, './node_modules/govuk_frontend_toolkit/stylesheets');
const govUkElementRoot = path.join(repoRoot, './node_modules/govuk-elements-sass/public/sass');

const assetsDirectory = './src/main/public';
const stylesheetsDirectory = `${assetsDirectory}/stylesheets`;

/**
 * Helper: copy a list of files to a destination.
 * - if flatten === true, copies all files into dest directly (basename)
 * - if baseDir is provided, preserves relative path from baseDir into dest
 */
async function copyFilesByPatterns(patterns, destRoot, { flatten = false, baseDir = null } = {}) {
  const files = await fg(patterns, { dot: true, onlyFiles: true, followSymbolicLinks: true });
  for (const src of files) {
    let rel;
    let outPath;
    if (flatten) {
      rel = path.basename(src);
      outPath = path.join(destRoot, rel);
    } else if (baseDir) {
      rel = path.relative(baseDir, src);
      outPath = path.join(destRoot, rel);
    } else {
      // preserve directory structure relative to cwd
      rel = path.relative(process.cwd(), src);
      outPath = path.join(destRoot, rel);
    }
    // ensure directory exists
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.copyFileSync(src, outPath);
  }
}

/**
 * SASS task - compiles SCSS files found in stylesheetsDirectory
 * Uses vinyl-fs to create a vinyl stream from resolved paths so gulp-sass works as expected.
 */
gulp.task('sass', async function () {
  // Resolve scss files
  const patterns = [`${stylesheetsDirectory}/*.scss`];
  const files = await fg(patterns, { onlyFiles: true, dot: true });

  if (!files || files.length === 0) {
    // no files to process
    return Promise.resolve();
  }

  // vinyl-fs.src accepts an array of paths (absolute or relative)
  // Use base so that dest writes into expected directory structure
  const stream = vfs.src(files, { base: stylesheetsDirectory, allowEmpty: true })
    .pipe(plumber())
    .pipe(sassPlugin({
      includePaths: [
        govUkFrontendToolkitRoot,
        govUkElementRoot
      ]
    }))
    .pipe(gulp.dest(stylesheetsDirectory))
    .pipe(livereload());

  return stream;
});

/**
 * copy-files - copies library JS and stylesheets into public assets
 */
gulp.task('copy-files', async function () {
  // 1) Copy specific JS libs (flattened) into assets/js/lib/
  await copyFilesByPatterns([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/jquery-validation/dist/jquery.validate.min.js',
    // The following patterns point into node_modules and may match many files:
    './node_modules/govuk_frontend_toolkit/javascripts/**/*.js',
    './node_modules/govuk_template_jinja/assets/javascripts/**/*.js'
  ], `${assetsDirectory}/js/lib/`, { flatten: true });

  // 2) Copy src/main/public/js/lib/**/* into assets/javascripts preserving relative structure from that base
  await copyFilesByPatterns(['src/main/public/js/lib/**/*.js'], `${assetsDirectory}/javascripts`, { flatten: false, baseDir: path.join(process.cwd(), 'src/main/public/js/lib') });

  // 3) Copy govuk_template_jinja stylesheets into stylesheetsDirectory preserving directory structure
  await copyFilesByPatterns(['./node_modules/govuk_template_jinja/assets/stylesheets/**/*'], `${stylesheetsDirectory}/`, { flatten: false, baseDir: path.join(process.cwd(), 'node_modules/govuk_template_jinja/assets/stylesheets') });

  return Promise.resolve();
});

/**
 * watch - watch scss files and run sass task
 */
gulp.task('watch', (done) => {
  gulp.watch(stylesheetsDirectory + '/**/*.scss', gulp.series('sass'));
  done();
});

/**
 * develop - start nodemon and livereload
 */
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
