const {ipcRenderer, Menu} = require('electron')
const mserver = require('./modbus/modbus_server')

var submitServerButton = document.getElementById("submitServerButton")
submitServerButton.addEventListener('click', function(event){
  event.preventDefault()
  var ipaddress = document.getElementById('ipaddress').value;
  var port = document.getElementById('port').value;
  var coils = document.getElementById('number_of_coils').value;
  var registers = document.getElementById('number_of_registers').value;

  parameters = {'ipaddress': ipaddress,
                'port': port,
                'coils': coils,
                'registers': registers}

  ipcRenderer.send('start-modbus-server', parameters)
  var mainPane = document.getElementById("main-pane")
  mainPane.className = "pane"
  var padPane = document.createElement('div')
  padPane.className = "padded-more"

  var number_of_rows = Math.floor(coils / 4)
  var part_row = coils % 4

  var table_data = [];
  for (i=0; i<number_of_rows; i++){
    table_data[i] = [(1+4*i).toString(), (2+4*i).toString(), (3+4*i).toString(), (4+4*i).toString()]
  }
  var j
  table_data[number_of_rows] = ['','','','']
  for (j=0; j<part_row; j++){
    table_data[number_of_rows][j] = (j+1+4*number_of_rows).toString()
  }

  var h4 = document.createElement('h4');
  var text = document.createTextNode('Coils:');
  h4.appendChild(text);
  padPane.appendChild(h4);

  document.getElementById("main-pane").appendChild(padPane);
  createTable(table_data);

  myTimer = window.setInterval(update_coil_states, 1000)

})

var myTimer

function update_coil_states(){
  ipcRenderer.send('update-coils-request', 'working')
}

ipcRenderer.on('update-coils-reply', (event, arg) => {
  bold_on_coils(arg.coils);
})

function bold_on_coils(coil_array){
  var i
  for (i=0; i<coil_array.length; i++){
    if (coil_array[i] == 1){
      document.getElementById("cell_id_" + i.toString()).style.fontWeight = 'bold';
    }
    else{
      document.getElementById("cell_id_" + i.toString()).style.fontWeight = '';
    }
  }
}



var endServerButton = document.getElementById("endServerButton")
endServerButton.addEventListener('click', function(event){
  ipcRenderer.send('end-modbus-server')
})

function createTable(tableData){
  var table = document.createElement('table');
  var id_num = 0;
  table.className = 'table-striped'
//  var thead = document.createElement('thead');
//  var header = document.createElement('tr');
//  var theader1 = document.createElement('th');
//  var theader2 = document.createElement('th');
//  var theader3 = document.createElement('th');
//  var theader4 = document.createElement('th');
//  var col1 = document.createTextNode('1');
//  var col2 = document.createTextNode('2');
//  var col3 = document.createTextNode('3');
//  var col4 = document.createTextNode('4');
//  theader1.appendChild(col1);
//  theader2.appendChild(col2);
//  theader3.appendChild(col3);
//  theader4.appendChild(col4);
//  header.appendChild(theader1);
//  header.appendChild(theader2);
//  header.appendChild(theader3);
//  header.appendChild(theader4);
//  thead.appendChild(header);

  var tbody = document.createElement('tbody');

  tableData.forEach(function(rowData){
    var row = document.createElement('tr');

    rowData.forEach(function(cellData){
      var cell = document.createElement('td');
      cell.id = "cell_id_" + id_num.toString();
      id_num = id_num + 1;
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
//  table.appendChild(thead);
  document.getElementById("main-pane").append(table);
}
