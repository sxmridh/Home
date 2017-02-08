'use strict';

const path = require('path');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const del = require('del');
const polymerJsonPath = path.join(process.cwd(), 'polymer.json');
const polymerJSON = require(polymerJsonPath);
const polymer = require('polymer-build');
const polymerProject = new polymer.PolymerProject(polymerJSON);
const buildDirectory = 'build';

const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');

function waitFor(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}

function build() {
    return new Promise((resolve, reject) => {
        console.log(`Deleting build/ directory...`);
        del([buildDirectory])
            .then(_ => {
                let sourcesStream = polymerProject.sources()
                    .pipe(polymerProject.splitHtml())
                    .pipe(gulpif(/\.js$/, uglify()))
                    .pipe(gulpif(/\.css$/, cssSlam()))
                    .pipe(gulpif(/\.html$/, htmlMinifier()))
                    .pipe(polymerProject.rejoinHtml());

                let depStream = polymerProject.dependencies()
                    .pipe(polymerProject.splitHtml())
                    .pipe(gulpif(/\.js$/, uglify()))
                    .pipe(gulpif(/\.css$/, cssSlam()))
                    .pipe(gulpif(/\.html$/, htmlMinifier()))
                    .pipe(polymerProject.rejoinHtml());

                let buildStream = mergeStream(sourcesStream, depStream)
                    .once('data', () => {
                        console.log('Analyzing build dependencies...');
                    });

                buildStream = buildStream.pipe(polymerProject.bundler);

                buildStream = buildStream.pipe(gulp.dest(buildDirectory));

                return waitFor(buildStream);
            })
            .then(_ => {
                console.log('Build complete!');
                resolve();
            });
    });
}

gulp.task('default', build);
