const webpack = require('webpack');
const path = require('path');


const config = (env, argv) => {
  return {
    entry: './src/index.ts',
    devtool: argv.mode == 'production' ? 'source-map' : 'eval-source-map',
    devServer: {
      historyApiFallback: {
        rewrites: [
          { from: /^\/arena$/, to: '/arena.html' },
          { from: /^\/subpage/, to: '/views/subpage.html' },
          { from: /./, to: '/views/404.html' },
        ],
      },
    },
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'js/bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.ts(x)?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [
        '.tsx',
        '.ts',
        '.js'
      ]
    }
  };
}

module.exports = config;