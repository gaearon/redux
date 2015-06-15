var sh = require('shelljs');

sh.exec('eslint src test', function(code, output) {

  if(code === 0){
    sh.exec('npm run clean');
    sh.exec('npm run build');
  } else {
    sh.echo('Exit code:', code);
    sh.echo('Program output:', output);
  }

});
