const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    game: "./src/game.js"
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public')
  },
  devServer: {
    contentBase: './public'
  },
};
