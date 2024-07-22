const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: (config, env) => {
    config.resolve.fallback = {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      "assert": require.resolve("assert/"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    };
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      })
    ];
    return config;
  }
};
