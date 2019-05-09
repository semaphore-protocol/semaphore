// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prod = process.env.NODE_ENV === 'production';

const browserConfig = {
  entry: "./client_web.js",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Semaphore",
      template: 'template.html'
    })
  ],
  resolve: {
  },
	mode: prod ? 'production' : 'development'
};

module.exports = [browserConfig];
