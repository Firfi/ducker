module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'node_modules/lodash/dist/lodash.js',
      'test/**/*Spec.js'
    ]
  });
};