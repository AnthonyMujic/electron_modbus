const {ipcRenderer} = require('electron')

var serverButton = document.getElementById("serverButton")
serverButton.addEventListener('click', function(event){
  ipcRenderer.send('modbus-server')
})

var clientButton = document.getElementById("clientButton")
clientButton.addEventListener('click', function(event){
  ipcRenderer.send('modbus-client')
})
