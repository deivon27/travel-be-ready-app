const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.react('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .copy('resources/images', 'public/images')
    .setResourceRoot('public')
    .browserSync('http://travel.devs')
    .options({
        processCssUrls: false,
        watchOptions: {
            ignored: /node_modules/
        }/*,
        loaders: {
            scss: [{loader: 'css-loader'}]
        }*/
    })
// Per this issue: https://github.com/JeffreyWay/laravel-mix/issues/1483
Mix.listen('configReady', (webpackConfig) => {
    if (Mix.isUsing('hmr')) {
        // Remove leading '/' from entry keys
        webpackConfig.entry = Object.keys(webpackConfig.entry).reduce(
            (entries, entry) => {
                entries[entry.replace(/^\//, '')] = webpackConfig.entry[entry];
                // }
                // console.log(entries);
                return entries;
            },
            {}
        );
        // Remove leading '/' from ExtractTextPlugin instances
        webpackConfig.plugins.forEach((plugin) => {
            if (plugin.constructor.name === "ExtractTextPlugin") {
                // console.log(plugin.filename);
                plugin.filename = plugin.filename.replace(/^\//, '');
                // console.log(plugin.filename);
            }
        });
    }

    //console.log(webpackConfig.output);
});


///// FOR EXPERIMENTS

/*
mix.webpackConfig({
    output: {
        publicPath: 'http://localhost:8080',
    },
    devServer: {
        hot: true, // this enables hot reload
        inline: true, // use inline method for hmr
        contentBase: path.join(__dirname, 'public'),
        port: 8080,
        headers: {'Access-Control-Allow-Origin': '*'},
        watchOptions: {
            exclude: [/bower_components/, /node_modules/]
        },
    },
    node: {
        fs: 'empty',
        module: 'empty',
    },
    /!*plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
        }),
    ],*!/
});*/


/*mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .copy('resources/images', 'public/images')
    .setResourceRoot('public')
    .browserSync('localhost:3000')
    .options({
        /!*hmrOptions: {
            host: 'localhost',
            port: 3000
        },*!/
        processCssUrls: false,
        watchOptions: {
            ignored: /node_modules/
        }
    })*/