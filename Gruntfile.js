module.exports = function(grunt) {

    
  var server = {
    app: 'src',
    dist: 'dist',
    test: 'test'
  };
    
  grunt.initConfig({
      
     //Project Settings
     appfolder: server,
     copy: {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= appfolder.app %>',
                src: ["./**"],
                dest: '<%= appfolder.dist %>'
            }]
        }
     },
     clean: {
        dist:['<%= appfolder.dist %>/*']
     }
  });

    
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');
  
    
  grunt.registerTask('build', ['clean', 'copy']);
  grunt.registerTask('start', ['build','connect']);
  

};