var getJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};
window.onload = function() {
  // Get references to elements on the page.
  var form = document.getElementById('message-form');
  var messagesList = document.getElementById('messages');
  var socketStatus = document.getElementById('status');
  var socketMOTD = document.getElementById('motd');
  var streamBtn = document.getElementById('stream');
  var closeBtn = document.getElementById('close');
  var censusCharacterId = "";
  var characterName = "";
  var world_id = {1: "Connery", 10: "Miller", 13: "Cobalt", 17: "Emerald", 19: "Jaeger", 25: "Briggs"};
  // Create a new WebSocket.
  var socket = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:example');
  // Handle any errors that occur.
  socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };
  // Show a connected message when the WebSocket is opened.
  socket.onopen = function(event) {
    socketStatus.innerHTML = 'Connected to: wss://push.planetside2.com/streaming?environment=ps2&service-id=s:example';
    socketStatus.className = 'open';
  };
  // Handle messages sent by the server.
  socket.onmessage = function(event) {
    var message = event.data;
    	// console.log (message);
    	var obj = JSON.parse(event.data);
    	if (obj.type === 'serviceMessage') {
	    	if (obj.payload.battle_rank > 15) {
	    		censusCharacterId = 'https://census.daybreakgames.com/get/ps2:v2/character/?character_id=' + obj.payload.character_id;
	    		getJSON(censusCharacterId).then(function(data) {
	    			characterName = data.character_list[0].name.first;
	    			messagesList.innerHTML += '<li class="received"><span>' + world_id[obj.payload.world_id] + ':</span>' + characterName + ' reached BR' + obj.payload.battle_rank + '</li>'
	    		}, function(status) { //error detection....
	    			window.alert('Something went wrong.');
	    		});
	    	};
    	};
  };
  // Show a disconnected message when the WebSocket is closed.
  socket.onclose = function(event) {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };
  // Send a message when the form is submitted.
  form.onsubmit = function(e) {
    e.preventDefault();
    // Retrieve the message from the textarea.
    var message = '{"service":"event","action":"subscribe","characters":["all"],"worlds":["all"],"eventNames":["BattleRankUp"]}';
    // Send the message through the WebSocket.
    socket.send(message);
    // Add the message to the messages list.
    console.log(message);
    socketMOTD.innerHTML = 'Service Started. Anyone who gets a battle rank over 15 will appear in the log below.';
    return false;
  };
  // Close the WebSocket connection when the close button is clicked.
  closeBtn.onclick = function(e) {
    e.preventDefault();
    
    socketMOTD.innerHTML = 'Connection closed. Please refresh the page to reconnect.';
    streamBtn.disabled = true; 
    // Close the WebSocket.
    socket.close();
    return false;
  };
};
