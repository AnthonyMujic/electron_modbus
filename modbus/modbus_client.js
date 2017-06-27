var modbus = require('jsmodbus');

var client;
var coils = [];
var registers = [];

module.exports.client = function(arg){
  client = modbus.client.tcp.complete({
          'host'              : arg.ipaddress,
          'port'              : arg.port,
          num_coils           : arg.coils,
          'logEnabled'        : true,
          'logTimestamp'      : true,
          'autoReconnect'     : true,
          'reconnectTimeout'  : 1000,
          'timeout'           : 5000,
          'unitId'            : 0
  });
  client.connect();
  return client;
};

module.exports.disconnect = function(){
  client.close();
};

module.exports.readCoils = function(){
  return coils;
};

module.exports.checkCoils = function(arg){
  client.readCoils(0, client.num_coils).then(function (resp) {
    coils = resp.coils;
  }, console.error)
}

module.exports.writeCoil = function(arg){
  var opposite_value = (arg.value === false) ? true:false;
  console.log('Exports arg.coil:', arg.coil);
  console.log('Exports value:', opposite_value);
    client.writeSingleCoil(arg.coil, opposite_value).then(function (resp) {
	    console.log(resp);

    }, console.error).finally(function () {
    });
  client.on('error', console.error)
}
