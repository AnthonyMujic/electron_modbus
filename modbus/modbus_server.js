'use strict'

var stampit = require('stampit')
var modbus = require('jsmodbus')

var server = stampit()
  .refs({
    number_of_coils: 10,
    number_of_registers: 10,
    coil_array: [],
    'logEnabled': true,
//    'logLevel': 'debug',
    'port': 8888,
    'responseDelay': 100,
    'coils': new Buffer(1024),
    'holding': new Buffer(1024),
    'whiteListIPs': [
      '127.0.0.1'
    ]
  }).compose(modbus.server.tcp.complete)
  .init(function () {

    console.log('Port:', this.port)
    console.log('Number of coils:', this.number_of_coils)
    console.log('Number of registers:', this.number_of_registers)

    this.coils = new Buffer(this.number_of_coils)
    this.holding = new Buffer(this.number_of_registers)

    var init = function () {

      resetAllCoils(this, this.number_of_coils)
      resetAllHoldingRegisters(this, this.number_of_registers)

      this.on('readCoilsRequest', function (start, quantity) {
//        console.log('readCoilsRequest', start, quantity)
      })

      this.on('readHoldingRegistersRequest', function (start, quantity) {
        console.log('readHoldingRegisters', start, quantity)
      })

      this.on('writeSingleCoilRequest', function (adr, value) {
        console.log('writeSingleCoil', adr, value)
      })

      this.on('postWriteMultipleCoilsRequest', function (start, quantity, byteCount) {
        console.log('postWriteMultipleCoils', start, quantity, byteCount)
      })

    }.bind(this)

    init()
  })
  .methods({
    readCoils(){
      return readAllCoils(this)
    }
  })

//server({number_of_coils: 20, number_of_registers: 0, 'port': 8502})

function resetAllCoils(server, number_of_coils){
  var i
  for (i=0; i<number_of_coils; i++){
    server.getCoils().writeUInt8(0, i)
  }
}

function resetAllHoldingRegisters(server, number_of_registers){
  var i
  for (i=0; i<number_of_registers - 1; i++){
    server.getHolding().writeUInt16BE(0, i)
  }
}

function readAllCoils(server){
//  console.log("Read all coils:")
  var number_of_bytes = Math.floor(server.number_of_coils / 8);
  var number_of_remaining_coils = server.number_of_coils % 8;
  var result = [];
  var i;
  for (i=0; i<number_of_bytes; i++){
    result = result.concat(decbin(server.getCoils()[i], 8))
  }
  result = result.concat(decbin(server.getCoils()[number_of_bytes], number_of_remaining_coils));
//  console.log(result);
  return result;
}

function decbin(dec, length){
  var result = [];
  var i;
  for (i=0; i < length; i++){
    result[i] = (dec >> i) & 1;
  }
  return result;
}

module.exports = function mserver(arg){
  return server({number_of_coils: arg.coils, number_of_registers: arg.registers, 'port': arg.port})
};
