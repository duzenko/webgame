const webpack = require('webpack');
const path = require('path');


const config = (env, argv) => {
  return {
    entry: './src/arena.ts',
    devtool: argv.mode == 'production' ? 'source-map' : 'eval-source-map',
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