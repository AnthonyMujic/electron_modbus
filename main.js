const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu} = electron
const mserver = require('./modbus/modbus_server')
const mclient = require('./modbus/modbus_client')

let win
let server
let serverWindow
let clientWindow

function createWindow(){
  win = new BrowserWindow({width:300, height:400})
  win.loadURL(`file://${__dirname}/index.html`)
//  win.webContents.openDevTools()
}

app.on('ready', () => {
  createWindow()

  ipcMain.on('modbus-server', (event, arg) => {
    openServerWindow()
    win.close()
  })

  ipcMain.on('modbus-client', (event, arg) => {
    openClientWindow()
    win.close()
  })
})

function openServerWindow(){
  serverWindow = new BrowserWindow({width:400,height:500})
  serverWindow.loadURL(`file://${__dirname}/server.html`)
//  serverWindow.webContents.openDevTools();
  console.log('Server configuration window loaded.')
  ipcMain.on('start-modbus-server', (event, arg) => {
    console.log("IPAddress: " + arg.ipaddress)
    console.log("Port: " + arg.port)
    console.log("Coils: " + arg.coils)
    console.log("Registers: " + arg.registers)
    server = mserver(arg)
    server.readCoils()
    serverWindow.setSize(800,500)
  })

  ipcMain.on('end-modbus-server', (event, arg) => {
    console.log("Destroying the server...")
    server.close()
    serverWindow.setSize(400,500)
  })

  ipcMain.on('update-coils-request', (event, arg) => {
    var parameters = {'coils': server.readCoils()}
    event.sender.send('update-coils-reply', parameters)
  })

}

function openClientWindow(){
  clientWindow = new BrowserWindow({width:400,height:500})
  clientWindow.loadURL(`file://${__dirname}/client.html`)
//  clientWindow.webContents.openDevTools();

  console.log('Client configuration window loaded.')
  ipcMain.on('connect-to-server', (event, arg) => {
    console.log("IPAddress: " + arg.ipaddress)
    console.log("Port: " + arg.port)
    console.log("Coils: " + arg.coils)
    client = mclient.client(arg)
    console.log(client);
    console.log("");
    mclient.checkCoils(arg.coils);
    console.log(mclient.readCoils());
    clientWindow.setSize(800,500)
  })

  ipcMain.on('disconnect-modbus-server', (event, arg) => {
    console.log("Disconnecting the client...")
    mclient.disconnect();
    clientWindow.setSize(400,500)
  })

  ipcMain.on('update-coils-request', (event, arg) => {
    mclient.checkCoils();
    var parameters = {'coils': mclient.readCoils()}
    event.sender.send('update-coils-reply', parameters)
  })

  ipcMain.on('write-coil-request', (event, arg) => {
    console.log('arg:', arg);
    values = mclient.readCoils()
    value = values[parseInt(arg)]
    console.log('values', values);
    console.log('value', value);
    var parameters = {'coil': parseInt(arg),
                      'value': value}
    console.log('parameter:', parameters);
    mclient.writeCoil(parameters);
  })

}

var menu = Menu.buildFromTemplate([
  {
    label: 'Modbus Client',
    submenu: [
      {
        label: 'about',
        click: function() {
        }
      }
    ]
  }
])
Menu.setApplicationMenu(menu)
