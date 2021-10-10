const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const TerserWebpackPlugin = require('terser-webpack-plugin');

const p = {
	build: {
		context: path.resolve(__dirname, 'dist'),
		allAssets: 'assets',
		// font: 'assets/fonts', //same as src
		// img: 'assets/img',
	},
	src: {
		context: path.resolve(__dirname, 'src'),
		allAssets: 'assets',
		font: 'assets/fonts',
		img: 'assets/img',
	},
};

const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

const filename = (ext = '') =>
	`[name]${isProd ? '.[hash]' : ''}${ext ? `.${ext}` : '[ext]'}`; //fullhash is not working with assets (isProd)

const ieProductionVersion = (() => {
	/**
	 * react-app-polyfill have plugins for ie11 and ie9
	 * so ieProductionVersion return:
	 * '' - if browserlist don't contains ie...
	 * 'ie11' - if browserlist contain ie11
	 * 'ie9' - if browserlist contain other ie version
	 * *not ie ... on browserlist is ignored
	 */
	let ieVersion = require('./package.json')
		.browserslist.replace(/\s/g, '')
		.toLowerCase()
		.split(',')
		.filter((item) => item.search(/^ie/g) !== -1)
		.toString();
	if (ieVersion) {
		ieVersion = ieVersion === 'ie11' ? ieVersion : 'ie9';
	}
	return ieVersion;
})();

const plugins = () => {
	const addPlugins = process.env.SERVE
		? [
				new ReactRefreshWebpackPlugin({
					overlay: false,
				}),
		  ]
		: [new CleanWebpackPlugin()];

	const base = [
		new HTMLWebpackPlugin({
			template: './index.html',
			minify: {
				collapseWhitespace: isProd,
			},
		}),
		new MiniCssExtractPlugin({
			filename: filename('css'),
		}),
		...addPlugins,
	];

	// if (isProd) {
	// 	base.push(new BundleAnalyzerPlugin());
	// }
	return base;
};

const babelOptions = ({ presets, plugins }) => {
	const opts = {
		presets: [
			[
				'@babel/preset-env',
				{
					targets: isDev
						? require('./package.json')['dev-babel-browserslist'] || 'defaults'
						: `${require('./package.json').browserslist}`,

					// debug: isProd, //for log target list
					// debug: true,
					useBuiltIns: 'usage',
					//prettier-ignore
					corejs: require('./package.json').dependencies['core-js'].replace('^',''),
				},
			],
			// ['@babel/preset-react', { runtime: 'automatic' }],
		],
		plugins: [],
		// plugins: ['@babel/plugin-proposal-class-properties'],
		// cacheDirectory: true,
		cacheDirectory: isDev,
		// cacheDirectory: false,
	};

	if (presets) {
		opts.presets.push(presets);
		/* [...presets].forEach((preset) => {
		opts.presets.push(preset);
		}); */
	}
	if (plugins) {
		opts.plugins.push(plugins);
		/* [...plugins].forEach((plugin) => {
		opts.plugins.push(plugin);
		}); */
	}
	if (process.env.SERVE) {
		opts.plugins.push('react-refresh/babel');
	}

	return opts;
};

const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: babelOptions({}),
		},
	];

	if (isDev) {
		loaders.push('eslint-loader');
	}

	return loaders;
};

const cssLoaders = (extra) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: { publicPath: '' },
		},
		'css-loader',
		'postcss-loader',
		'group-css-media-queries-loader',
	];

	if (extra) {
		loaders.push(extra);
	}

	return loaders;
};

const optimization = () => {
	const config = {
		/* splitChunks: {
			chunks: 'all',
		}, */
	};

	/* if (isProd) {
		config.minimizer = [
			// new CssMinimizerPlugin(),
			// new TerserWebpackPlugin(),
		];
	} */
	if (process.env.SERVE) {
		config.runtimeChunk = 'single';
	}

	return config;
};

module.exports = {
	context: p.src.context,
	mode: process.env.NODE_ENV || 'development',
	target: isDev ? 'web' : 'browserslist',

	entry: {
		main: ((fileName = './index.jsx') => {
			return ieProductionVersion && isProd
				? [`react-app-polyfill/${ieProductionVersion}`, fileName]
				: fileName;
		})(),
		// analytics: './analytics.ts',
		// loader: './loader.js',
	},

	output: {
		filename: filename('js'),
		publicPath: ieProductionVersion ? '' : 'auto',
		path: p.build.context,
		assetModuleFilename: `${p.build.allAssets}/${filename()}`,
	},

	resolve: {
		extensions: ['.js', '.jsx', '.json', '.png'],
		alias: {
			// '@models': path.resolve(__dirname, 'src/models'),
			'@img': p.src.context + '/' + p.src.img,
			'@icons': p.src.context + '/' + p.src.allAssets + '/icons',
			'@font': p.src.context + '/' + p.src.font,
			'@': p.src.context,
			// modernizr$: path.resolve(__dirname, '.modernizrrc'),
		},
	},

	plugins: plugins(),
	devtool: isDev ? 'source-map' : false,
	// devtool: isDev ? 'eval-source-map' : false,

	devServer: {
		// open: true,
		port: 3000,
		hot: process.env.SERVE ? true : false, //must be true with react HotMR
		// watchFiles: [context + 'src/**/*.html'],
	},

	optimization: optimization(),

	module: {
		rules: [
			{
				test: /\.css$/i,
				use: cssLoaders(),
			},

			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader'),
			},

			/*
			{
				test: /\.modernizrrc$/,
				loader: 'modernizr',
			},
			{
				test: /\.modernizrrc.js$/,
				loader: 'modernizr',
			},
			 {
				test: /\.modernizrrc(\.json)?$/,
				// loader: 'modernizr!json',
				loader: 'modernizr',
			}, 
			*/

			{
				test: /\.(png|jpe?g|gif|svg|webp)$/i,
				type: 'asset/resource',
				// type: 'asset',
				// parser: { dataUrlCondition: { maxSize: 30 * 1024 } }, //default 8 Kb
				generator: {
					// filename: `${p.build.img}/${filename()}`,
					filename: `[path]${filename()}`,
				},
			},

			{
				test: /\.(woff|woff2)$/i,
				type: 'asset/resource',
				generator: {
					// filename: `${p.build.font}/[path]${filename()}`,
					filename: `[path]${filename()}`,
				},
			},

			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoaders(),
				/* use: {
					loader: 'babel-loader',
					options: babelOptions({}),
				}, */
			},

			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					// options: babelOptions({ presets: '@babel/preset-react' }),
					options: babelOptions({
						presets: ['@babel/preset-react', { runtime: 'automatic' }],
					}),
					// options: babelOptions({}),
				},
			},

			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: babelOptions({ presets: '@babel/preset-typescript' }),
				},
			},
		],
	},
};
