import document from "document";
import * as messaging from "messaging";

let mybutton = document.getElementById("mybutton");
let background = document.getElementById("background");
let firstbutton = document.getElementById("firstbutton");
let lineone = document.getElementById("lineone");
let myPopup = document.getElementById("my-popup");
let linetwo = document.getElementById("linetwo");
let list = document.getElementById("list");
let choices = document.getElementById("choices");
let previous = document.getElementById("btn-br");
let reset = document.getElementById("btn-tr");
let VTList = document.getElementById("my-list");
let btnRight = document.getElementById("btnRight");
let displayDestBlock = document.getElementById("mixedblock");
let mixedtext = document.getElementById('mixedtext');
let mixedtextheader = mixedtext.getElementById("header");
let mixedtextcopy = mixedtext.getElementById("copy")
let settingsbutton = document.getElementById('btn-tl');
let settings = document.getElementById('settings');
let combo = document.getElementById("combobuttons")
let increase = document.getElementById('increase');
let decrease = document.getElementById('decrease');
let radtext = document.getElementById('radiustext');
let submitRadius = document.getElementById('submit');
let folder = document.getElementById('btn-bl');
let save = document.getElementById('save');
let confirmDelete = document.getElementById('confirmDelete');
let delet = document.getElementById('delete');
let checkedList = document.getElementById('my-deletes');
let checkedBoxes = checkedList.getElementsByClassName('tile-list-item2');
let confirmBack = document.getElementById('confirmBackground');
let verticalSep = document.getElementById('vertical-seperator');
let taskbar = document.getElementById('top-rect');
let headertext = displayDestBlock.getElementById("header");
let bodytext = displayDestBlock.getElementById("copy");
let error = document.getElementById('error');
let NoStops = document.getElementById('NoStops');
let state = '';


messaging.peerSocket.onmessage = evt => {
  let str = JSON.stringify(evt.data.command).slice(1, -1);
  let val = evt.data.arr;
  mixedtext.style.display = "none";
  NoStops.style.display = 'none'
  VTList.style.display = "none";
  myPopup.style.display = "none";
  settings.style.display = "none";
  delet.style.display = 'none';
  confirmDelete.style.display = 'none'
  previous.style.display = 'inline';
  reset.style.display = 'inline';
  verticalSep.style.display = 'inline';

  appHandler[str](val);
}
let appHandler = {
  Init() {
    folder.style.display = 'inline';
    settingsbutton.style.display = 'inline';
    taskbar.style.display = 'inline';
    firstbutton.style.display = "inline";
    VTList.style.display = "none";
    combo.style.display = 'inline'
    save.style.display = 'none';
  },
  BusOptions(data) {
    myPopup.style.display = "none";
    choices.style.display = "inline";
    VTList.style.display = "inline";
    folder.style.display = 'inline';
    let arr = data;
    if (arr.length === 0) {
      NoStops.style.display = 'inline';
    }
    mylist('findRelevantStops', arr);
  },
  selectedstops(data) {
    choices.style.display = "inline";
    VTList.style.display = "inline";
    folder.style.display = 'inline';
    save.style.display = 'none';
    let arr = data;
    console.log("Selected Stops");
    mylist("displayDestination", arr);
  },
  StopDestination(dest) {
    folder.style.display = 'none';
    save.style.display = 'inline';
    myPopup.style.display = "inline";
    btnRight.text = "Confirm"
    btnRight.onclick = () => {
      sendVal({ command: "listofTimes" });
      console.log("send");
    }
    if (dest == '') {
      bodytext.text = '';
      headertext.text = "No Buses on Route";
      confirmBack.style.display = 'none';
      btnRight.style.display = "none";

    }
    else {
      headertext.text = "Confirm Route Destination"
      btnRight.style.display = "inline";
      confirmBack.style.display = 'inline'
      bodytext.text = dest;
    }
  },
  busDistances(data) {
    save.style.display = "inline"
    folder.style.display = 'none';
    choices.style.display = "inline";
    VTList.style.display = "inline";
    mylist("displayETA", data);
  },
  ETAsent(data) {
    mixedtext.style.display = 'inline';
    mixedtextcopy.text = `Bus Distance: ${data[1]}`;
    mixedtextheader.text = `ETA: ${data[0]}`;
  },
  loadCache(data) {
    firstbutton.style.display = 'none';
    choices.style.display = "inline";
    VTList.style.display = "inline";
    settingsbutton.style.display = 'none';
    folder.style.display = 'none';
    delet.style.display = 'inline';
    save.style.display = 'none'
    let farr = data;
    mylist("selectSavedStop", farr);
  },
  deleteCache(data) {
    confirmDelete.style.display = 'inline';
    firstbutton.style.display = 'none';
    choices.style.display = "inline";
    VTList.style.display = "inline";
    settingsbutton.style.display = 'none';
    folder.style.display = 'none';
    let farr = data;
    mylist("deleteSelections", farr);
  }
}
settingsbutton.onclick = evt => {
  firstbutton.style.display = "none";
  settings.style.display = 'inline';
  combo.style.display = "none";
  taskbar.style.display = 'none';
  reset.style.display = 'none';
  previous.style.display = 'none';
  folder.style.display = 'none'
  verticalSep.style.display = 'none'
  let count = radtext.text;
  count = count.replace(' Miles', '');
  count = parseFloat(count);

  increase.onclick = (evt) => {
    if (count < 2.0) {
      count += 0.1;
    }
    count = parseFloat(count.toFixed(1));
    radtext.text = `${count} Miles`;
  }

  decrease.onclick = evt => {
    if (count > 0.1) {
      count -= 0.1;
    }
    count = parseFloat(count.toFixed(1))
    radtext.text = `${count} Miles`
  }

  submitRadius.onclick = () => {
    sendVal({ command: "setRadius", data: count });
  }
}

folder.onclick = () => {
  sendVal({ command: "loadCache" });
}

save.onclick = () => {
  sendVal({ command: "saveToCache" })
}

delet.onclick = () => {
  sendVal({ command: "deleteCache" });
}

confirmDelete.onclick = () => {
  console.log("DELETE");
  let arr = [];
  checkedBoxes.forEach((element, index) => {
    console.log(element.value);
    if (element.value) {
      element.value = 0; 
      arr.push(element.parent.text);
  
    }
  })
  console.log(arr);
  sendVal({ command: "confirmDelete", data: arr })
}

reset.onclick = evt => {

  sendVal({ command: "Init" });
}

mybutton.onclick = async function (evt) {

  settingsbutton.style.display = 'none';
  firstbutton.style.display = "none";

  let data = {
    command: 'findLocalStops',

  };
  sendVal(data);
}

previous.onclick = evt => {
  console.log("previous")
  sendVal({ command: "previousState" });
};

function mylist(str, array) {
  let NUM_ELEMS;
  if (array.length < 21) {
    NUM_ELEMS = array.length;
  }
  else {
    NUM_ELEMS = 20;
  }
  let i = 0;
  VTList.delegate = {
    getTileInfo: function (index) {
      let type = "my-pool";
      if (str === "deleteSelections") {
        type = 'my-deletes'
      }
      return {
        type: type,
        value: state === "one" ? "one" : state === "two" ? "two" : "three",
        index: index
      };
    },
    configureTile: function (tile, info) {
      if (info.type == "my-pool") {
        tile.getElementById("text").text = `${array[i++]}`;
        let touch = tile.getElementById("touch-me");
        touch.onclick = evt => {
          console.log(tile.getElementById("text").text)
          sendVal({ command: str, data: tile.getElementById("text").text })
          console.log(`touched: ${info.index}`);
          VTList.style.display = "none";
        };
      }
      if (info.type == "my-deletes") {
        tile.getElementById("text").text = `${array[i++]}`;
        let touch = tile.getElementById("touch-me");
        touch.onclick = evt => {
          console.log(tile.getElementById("text").text)
          sendVal({ command: str, data: tile.getElementById("text").text })
          console.log(`touched: ${info.index}`);
          VTList.style.display = "none";
        };
      }
    }
  };
  VTList.length = NUM_ELEMS;
}

messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
  error.style.display = 'none';
};

messaging.peerSocket.onclose = (event) => {
  console.log("App Socket Closed");
  if (!event.wasClean) {
    error.style.display = 'inline'
  }
};

function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}