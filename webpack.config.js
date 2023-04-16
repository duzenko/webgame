const webpack = require('webpack');
const path = require('path');


const config = (env, argv) => {
  console.log(`This is the Webpack 4 'mode': ${argv.mode}`);
  return {
    entry: './src/index.ts',
    devtool: argv.mode == 'production' ? 'source-map' : 'eval-source-map',
    devServer: {
      devMiddleware: {
        writeToDisk: true,
      },
    },
    output: {
      path: path.resolve(__dirname, 'public/js'),
      filename: 'bundle.js'
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