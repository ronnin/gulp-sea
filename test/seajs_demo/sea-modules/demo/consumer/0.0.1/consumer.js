define('demo/consumer/0.0.1/consumer', ['demo/mmodule/0.0.1/mmodule'], function(require, exports, module){
  console.log('to consume', require.resolve('ma'));
  console.log('to consume', require.resolve('mb'));

  var a = require('ma'),
      b = require('mb');

  console.log('consuming', a, '&&', b);
  return 'demo_consumer@' + module.uri;
});
