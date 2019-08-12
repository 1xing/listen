const {
  override,
  addBundleVisualizer,
  addWebpackAlias,
  fixBabelImports,
  addWebpackExternals
} = require('customize-cra');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = override(
  fixBabelImports('lodash', {
    libraryDirectory: '',
    camel2DashComponentName: false
  }),
  fixBabelImports('react-use', {
    libraryDirectory: 'esm',
    camel2DashComponentName: false
  }),
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src')
  }),
  addBundleVisualizer({}, true),
  isProduction &&
    addWebpackExternals({
      react: 'React',
      'react-dom': 'ReactDOM'
    })
);
