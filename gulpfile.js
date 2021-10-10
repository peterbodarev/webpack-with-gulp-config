let fs = require('fs');
let srcFiles = 'src';

let source_folder = 'gulp src';
let project_folder = 'src';

let folders = {
	img: 'assets/img',
	font: 'assets/fonts',
};

let extensions = {
	img: '{jpg,png,svg,gif,ico,webp}',
	font: 'ttf',
};

let path = {
	build: {
		img: project_folder + `/${folders.img}/`,
		fonts: project_folder + `/${folders.font}/`,
		recovery: 'recovery/',
	},
	src: {
		img: source_folder + `/${folders.img}/` + '**/*.' + extensions.img,
		fonts: source_folder + `/${folders.font}/` + '*.' + extensions.font,
		recovery: [project_folder + '/**/*'],
	},
	watch: {
		img: source_folder + `/${folders.img}/**/*.${extensions.img}`,
	},
	clean: Object.values(folders).map((f) => `./${project_folder}/${f}/`),
};

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70,
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3, //0 to 7
			})
		)
		.pipe(dest(path.build.img));
}

function fonts(params) {
	src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
	return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function need() {
	return src(path.src.need).pipe(dest(path.build.need));
}
// let watchNeed = need;
let watchNeed = gulp.series((params) => {
	return del(path.clean + srcFiles + '/');
}, need);

//enter gulp ott2ttf to transform fonts .otf in .ttf (in source file)
gulp.task('otf2ttf', function () {
	return src([source_folder + `/${folders.font}/` + '*.otf'])
		.pipe(fonter({ formats: ['ttf'] }))
		.pipe(dest(source_folder + `/${folders.font}/`));
});

/* 
//to call open second terminal when gulp is running and enter command 'gulp svgSprite'
gulp.task('svgSprite', function () {
	return gulp
		.src([source_folder + '/iconsprite/*.svg'])
		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: '../icons/icon.svg', //sprite file name
						example: true,
					},
				},
			})
		)
		.pipe(dest(path.build.img));
}); 
*/

async function fontsStyle(params) {
	let fsPath = `${project_folder}/styles/font/fonts.scss`;
	let file_content = fs.readFileSync(fsPath);
	if (file_content == '') {
		fs.writeFile(fsPath, '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(
							fsPath,
							'@include font("' +
								fontname +
								'", "400", "normal", "' +
								fontname +
								'");\r\n',
							cb
						);
					}
					c_fontname = fontname;
				}
				// let fontsFileComment = '';
				let fontsFileComment =
					"// template: @include font(font-family, font-weight, font-style, ***file name***)\r\n// don't modify ***file name*** !!!\r\n// function fontsStyle works just when this file is empty\r\n// This function read font files(.woff & .woff2) from 'path.build.fonts'";
				fs.appendFile(fsPath, '\r\n' + fontsFileComment + '\r\n', cb);
			}
		});
	}
}

function cb() {}

function watchFiles(params) {
	gulp.watch([path.watch.img], images);
}

function clean(params) {
	return del(path.clean);
}

function recovery(params) {
	const d = new Date();
	// const strD = d
	// 	.toISOString()
	// 	.split('.')[0]
	// 	.replace(/:|-/g, '.')
	// 	.replace(/T/g, '--');
	const strD =
		d.toISOString().split('T')[0] +
		'--' +
		d.toLocaleTimeString('it-IT').replace(/:/g, '.');
	// console.log(strD);
	return src(path.src.recovery).pipe(dest(path.build.recovery + strD + '/'));
}

let build = gulp.series(
	// recovery,
	clean,
	gulp.parallel(images, fonts),
	fontsStyle
);
let watch = gulp.parallel(build, watchFiles);

// exports.recovery = recovery;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.build = build;

exports.watch = watch;
exports.default = watch;

//=============================
