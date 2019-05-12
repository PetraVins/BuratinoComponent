const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [
    './src/js/index.js',
  ],
  entry: {
    main: './src/js/index.js',
    test: './src/components/print-string/index.js'
  },
  output: {
    filename: './js/[name].js'
  },
  devtool: "source-map",
  devServer: {
    port: 3000,
  },
  module: {
    rules: [{
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        loader: 'babel-loader',
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [
                require('autoprefixer')()
              ]
            }
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          },
        ]
      },
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pug/pages/index.pug'
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};