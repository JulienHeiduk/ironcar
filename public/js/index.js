var socket = io.connect();

// -------- KEYBOARD INPUT -----------
kinput.onkeydown = kinput.onkeyup = kinput.onkeypress = handle;

function handle(e) {
    // Gas control
    if (e.key == "ArrowDown" && e.type == "keydown" && !e.repeat) {
        socket.emit("gas", -1);
    }
    if (e.key == "ArrowUp" && e.type == "keydown" && !e.repeat) {
        socket.emit("gas", 1);
    }
    if (e.key == "ArrowUp" && e.type == "keyup" && !e.repeat) {
        socket.emit("gas", 0);
    }
    if (e.key == "ArrowDown" && e.type == "keyup" && !e.repeat) {
        socket.emit("gas", 0);
    }

    // Direction control
    if (e.key == "ArrowLeft" && e.type == "keydown" && !e.repeat) {
        socket.emit("dir", -1);
    }
    if (e.key == "ArrowRight" && e.type == "keydown" && !e.repeat) {
        socket.emit("dir", 1);
    }
    if (e.key == "ArrowLeft" && e.type == "keyup" && !e.repeat) {
        socket.emit("dir", 0);
    }
    if (e.key == "ArrowRight" && e.type == "keyup" && !e.repeat) {
        socket.emit("dir", 0);
    }

}

// -------- MAX SPEED UPDATE -----------

function maxSpeedUdate() {
    var newMaxSpeed = document.getElementById("maxSpeedSlider").value;
    document.getElementById("maxSpeed").innerHTML = "Max speed limit: " + newMaxSpeed + "%";
    socket.emit("maxSpeed", newMaxSpeed / 100.);
}

// update the current max speed
socket.on('maxSpeedUpdate', function (maxSpeed) {
    document.getElementById("maxSpeed").innerHTML = "Max speed limit: " + Math.round(maxSpeed * 100) + "%";
    document.getElementById("maxSpeedSlider").value = maxSpeed * 100;
});


// -------- MODE -----------

var modes = ["training", "auto", "dirauto", "rest"];

function modeSwitched(i) {
    console.log(modes[i]);
    socket.emit("modeSwitched", modes[i]);
}

// update the selected mode in the radio page
socket.on('mode_update', function (newMode) {
    var newModeIndex = modes.indexOf(newMode);
    var radios = document.getElementById("modesForm");
    radios[newModeIndex].checked = true;
});

// -------- STARTER -----------

function starter() {
    var startButton = document.getElementById('starter')
    if (startButton.innerHTML === 'Start') {
        startButton.className = "btn btn-warning btn-lg btn-block startButton"
    } else {
        startButton.className = "btn btn-primary btn-lg btn-block startButton"
    }
    socket.emit('starter');
}

socket.on('starterUpdate', function (data) {
    var state = 'Stop';
    if (data == "stopped") {
        state = 'Start';
    }
    document.getElementById("starter").innerHTML = state;
});
// -------- AUTOPILOT MODEL -----------

socket.on('new_available_model', function (modelList) {
    var mySelect = document.getElementById("model_select");
    var oldOptions = mySelect.options;
    var selectedModel = mySelect.selectedIndex;

    for (var i = oldOptions.length - 1; i >= 0; i--) {
        if (selectedModel == -1 || mySelect.options[i].text !== mySelect.options[mySelect.selectedIndex].text) {
            mySelect.options.remove(i);
        } else {
            if (modelList.indexOf(mySelect.options[i].text) === -1) {
                mySelect.options.remove(i);
                selectedModel = -1;
            }
        }
    }
    if (selectedModel === -1) {
        var option = document.createElement("option");
        option.text = "";
        mySelect.add(option);
        mySelect.selectedIndex = mySelect.options.length;
    } else {
        selectedModel = mySelect.options[mySelect.selectedIndex].text;
    }
    for (i = 0; i < modelList.length; i++) {
        if (modelList[i] !== selectedModel) {
            option = document.createElement("option");
            option.text = modelList[i];
            mySelect.add(option);
        }
    }
});

function model_selected(mySelect) {
    if (mySelect.options[0].text == "") {
        mySelect.remove(0);
    }
    var modelName = mySelect.options[mySelect.selectedIndex].text;
    socket.emit('model_update', modelName);
}

socket.on("model_update", function (modelSelected) {
    var mySelect = document.getElementById("model_select");
    for (var i = 0; i < mySelect.options.length; i++) {
        if (modelSelected == mySelect.options[i].text) {
            var modelIndex = i;
        }
    }
    mySelect.selectedIndex = modelIndex;
});

socket.on('fps', function (fps) {
    document.getElementById("fps").innerHTML = fps;
})

socket.on('direction', function(direction) {
    document.getElementById("angle").innerHTML = direction;
})

// -------- USER INFO -----------

// Message to the user
socket.on('msg2user', function (message) {
    document.getElementById("Status").innerHTML = message;
});

socket.emit('clientLoadedPage', true);