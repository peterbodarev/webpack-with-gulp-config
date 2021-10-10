module.exports = {
	// plugins: ['postcss-preset-env'],
	plugins: [
		'postcss-preset-env',
		{
			'webp-in-css/plugin': {
				webpClass: 'webp',
				noWebpClass: 'no-webp',
				addNoJs: false,
			},
		},

		// 'postcss-font-magician',

		/* {
			'postcss-font-magician': {
				// variants: {
				// 	Roboto: {
				// 		400: ['woff, woff2'],
				// 	},
				// 	Lato: {
				// 		'400 normal': ['woff, woff2'],
				// 		'400 italic': ['woff, woff2'],
				// 		700: ['woff, woff2'],
				// 	},
				// },
				foundries: ['google'],
			},
		}, */
	],
};
