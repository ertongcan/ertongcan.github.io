const path = require('path');

module.exports = {
  entry: './game.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './www'),
  },
  mode: 'development',
  devtool: 'source-map',
};
