var path = require('path');
var webpack = require('webpack');
var postcssImport = require('postcss-import');
var port = parseInt(process.env.PORT) || 3000;

module.exports = {
  progress: true,
  devtool: 'cheap-module-eval-source-map',
  entry: {
    main: [
      'eventsource-polyfill', // necessary for hot reloading with IE
      'webpack-hot-middleware/client?path=http://localhost:' + port + '/__webpack_hmr',
      './src/index'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'http://localhost:' + port + '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: true
    })
  ],
  module: {
    loaders: [
      { test: /\.jsx?/, loaders: ['babel'], exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss' }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules', 'src'],
    extensions: ['', '.js', '.jsx', '.css']
  },
  postcss: function(webpack) {
    return [
      postcssImport({
          addDependencyTo: webpack
      }),
      require('autoprefixer'), // Automatically include vendor prefixes
      require('postcss-nested') // Enable nested rules, like in Sass
    ];
  }
};
