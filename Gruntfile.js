module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('tests', [
    'mochaTest:integration'
  ]);

  grunt.registerTask('build', [
    'coffee:compile'
  ]);

  grunt.initConfig({
    mochaTest : {
      options : {
        reporter : 'dot',
        require  : [
          'should'
        ]
      },
      integration : {
        src : [
          'test/integration/**/*.js'
        ]
      }
    },
    coffee : {
      compile : {
        expand  : true,
        flatten : true,
        cwd     : 'src',
        src     : [ '*.coffee' ],
        dest    : 'lib',
        ext     : '.js'
      }
    }
  });
};