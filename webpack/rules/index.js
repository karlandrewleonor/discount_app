const path = require('path');
const image = require('./image');
const javascript = require('./javascript');

// remove CSS File
// const css = require('./css');

const postcssImport = require('postcss-import');
const postcssCssnext = require('postcss-cssnext');
const postcssReporter = require('postcss-reporter');
const PATHS = require('../paths');


const localIdentName = 'localIdentName=[name]__[local]___[hash:base64:5]';

module.exports = ({ production = false, browser = false } = {}) => (
  [
    javascript({ production }),
    
    {
      test: /\.css$/,
      exclude: /node_modules/,
      use: ['style-loader', 'css-loader'],
    },    
    {
      // Preprocess 3rd party .css files located in node_modules
      test: /\.css$/,
      include: /node_modules/,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: 'svg-url-loader',
          options: {
            // Inline files smaller than 10 kB
            limit: 10 * 1024,
            noquotes: true,
          },
        },
      ],
    },
    {
      test: /\.css$/,
      exclude: /node_modules/,
      loader: 'postcss-loader',
      options: {
        ident: 'postcss',
        plugins: [
          postcssImport({ path: path.resolve(PATHS.app, './css') }),
          postcssCssnext({ browsers: ['> 1%', 'last 2 versions'] }),
          postcssReporter({ clearMessages: true })
        ]
      }
    },

    image()
  ]
);


// css({ production, browser }),