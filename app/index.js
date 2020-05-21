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
//let btnLeft = document.getElementById("btnLeft");
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

let displayRoute = true
let state = '';


VTList.style.display = "none";
myPopup.style.display = "none";
list.style.display = "none";
mixedtext.style.display  = 'none';
// settings.style.display = "none";




function directionbuttons(arr) {
  myPopup.style.display = "inline";
  let btnLeft = myPopup.getElementById("btnLeft");
  let btnRight = myPopup.getElementById("btnRight");
  btnLeft.text = arr[0];
  btnRight.text = arr[1];
  btnLeft.onclick = function (evt) {
    myPopup.style.display = "none";
    sendVal({ command: "FindStops", direction: arr[0] })
  }
  btnRight.onclick = function (evt) {
    myPopup.style.display = "none";
    sendVal({ command: "FindStops", direction: arr[1] })
  }
}


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
      if (str === "deleteSelections"){
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
          sendVal({ command: str, BusNum: tile.getElementById("text").text })
          console.log(`touched: ${info.index}`);
          VTList.style.display = "none";
        };
      }
      if (info.type == "my-deletes") {
        tile.getElementById("text").text = `${array[i++]}`;
        let touch = tile.getElementById("touch-me");
        touch.onclick = evt => {
          console.log(tile.getElementById("text").text)
          sendVal({ command: str, BusNum: tile.getElementById("text").text })
          console.log(`touched: ${info.index}`);
          VTList.style.display = "none";
        };
      }
    }
  };
  VTList.length = NUM_ELEMS;
}

function mylist2(array) {
  let NUM_ELEMS = array.length;

  let i = 0;
  VTList.delegate = {
    getTileInfo: function (index) {
      return {
        type: "my-pool",
        value: "Menu item",
        index: index
      };
    },
    configureTile: function (tile, info) {
      if (info.type == "my-pool") {
        tile.getElementById("text").style.fontSize = "25px";
        tile.getElementById("text").text = `${array[i++]}`;
        let touch = tile.getElementById("touch-me");
        touch.onclick = evt => {
          sendVal({ command: "BusSelection", BusNum: tile.getElementById("text").text })
          console.log(`touched: ${info.index}`);
          VTList.style.display = "none";
        };
      }
    }
  };



  VTList.length = NUM_ELEMS;
}
//VTList.style.display="none";


// Send data to device using Messaging API
function sendVal(data) {

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

settingsbutton.onclick = evt => {
  firstbutton.style.display = "none";
  settings.style.display = 'inline';
  combo.style.display = "none";
  taskbar.style.display= 'none';
  reset.style.display = 'none';
  previous.style.display = 'none';
  folder.style.display ='none'
  verticalSep.style.display='none'
  let count = radtext.text;
  count = count.replace(' Miles', ''); 
  count = parseFloat(count);
  // function parse(arg){
  //   return Number.parseFloat(arg).toFixed(2);
  // }

increase.onclick = (evt) => {
  if(count < 2.0){
    count += 0.1;
  }
  count = parseFloat(count.toFixed(1));
  console.log(count);
  

  radtext.text = `${count} Miles`;
  // count = parseFloat(count);
}

decrease.onclick = evt => {  
  if (count > 0.1){
    count -=0.1;
  }
  
  count = parseFloat(count.toFixed(1))
  radtext.text = `${count} Miles`
}

submitRadius.onclick = () => {
  sendVal({ command: "Radius", data: count });
}

}

folder.onclick = () => {
  sendVal({ command: "loadCache"});
}

save.onclick = () => {
  sendVal({command: "save"})
}

delet.onclick = () => {
  sendVal({command: "deleteCache"});
}

confirmDelete.onclick = () => {
  console.log("DELETE");
  let arr= [];
  checkedBoxes.forEach((element, index) => {
    console.log(element.value);
    if (element.value){
    arr.push(element.parent.text);
    
  } // initial state

  // element.firstChild.onclick = (evt) => {
    //   tileState[index] = !tileState[index];
    //   console.log(`item ${index} :: ${tileState[index] ? "checked" : "unchecked"}`)
    // };
  })
  console.log(arr);
  sendVal({command: "confirm", arr: arr})
}

reset.onclick = evt => {

  sendVal({ command: "Init" });
}

mybutton.onclick = async function (evt) {

  settingsbutton.style.display ='none';
  firstbutton.style.display = "none";
  
  let data = {
    command: 'BusStops',

  };

  sendVal(data);


}

previous.onclick = evt => {
  console.log("previous")
  sendVal({ command: "previousstate" });
};

// Message is received
messaging.peerSocket.onmessage = evt => {
  let str = JSON.stringify(evt.data.command);
  str = str.slice(1, -1);
  mixedtext.style.display ="none";
  NoStops.style.display = 'none'
  VTList.style.display = "none";
  myPopup.style.display = "none";
  list.style.display = "none";
  settings.style.display = "none";
  delet.style.display = 'none';
  confirmDelete.style.display = 'none'
  previous.style.display ='inline';
  reset.style.display ='inline';
  verticalSep.style.display='inline';


  if (str === "Init") {
    folder.style.display ='inline';
    settingsbutton.style.display ='inline';
    taskbar.style.display = 'inline';
    firstbutton.style.display = "inline";
    VTList.style.display = "none";
    combo.style.display = 'inline'
    save.style.display = 'none';
    
    

  }
  else if (str === "BusOptions") {
    myPopup.style.display = "none";
    choices.style.display = "inline";
    VTList.style.display = "inline";
    folder.style.display = 'inline';

    let arr = evt.data.arr;
    if(arr.length === 0){
      NoStops.style.display = 'inline';
    }
    mylist("BusSelection", arr);
  }
  else if (str === "Directions") {
    console.log("Recieved");
    VTList.style.display = "inline";
    mylist("FindStops", evt.data.arr);
    //directionbuttons(evt.data.arr);
  }
  else if (str === "selectedstops") {
    choices.style.display = "inline";
    VTList.style.display = "inline";
    folder.style.display ='inline';
    save.style.display = 'none';
    let arr = evt.data.arr;
    console.log("Selected Stops");
    mylist("SelectedStop", arr);
  }
  else if (str === "StopDestination") {
    
    DisplayDestination(evt.data.arr);
  }
  else if (str === "busDistances") {
    
    showDistances(evt.data.arr);
  }

  else if (str === "ETAsent"){
    mixedtext.style.display = 'inline';
    ////mixedtextheader.text = "7"
    // let mixedtextheader = mixedtext.getElementById("header");
    // let mixedtextcopy = mixedtext.getElementById("copy")
    mixedtextcopy.text = `Bus Distance: ${evt.data.arr[1]}`;
    mixedtextheader.text = `ETA: ${evt.data.arr[0]}`;
  }

  else if (str==="loadStorage"){
    firstbutton.style.display = 'none';
    choices.style.display = "inline";
    VTList.style.display = "inline";
    settingsbutton.style.display ='none';
    folder.style.display = 'none';
    delet.style.display = 'inline';
    save.style.display = 'none'
    let farr = evt.data.arr;
    mylist("savedStopSelect", farr);
  }

  else if (str === "deleteCache"){
    confirmDelete.style.display ='inline';
    firstbutton.style.display = 'none';
    choices.style.display = "inline";
    VTList.style.display = "inline";
    settingsbutton.style.display ='none';
    folder.style.display = 'none';
    let farr = evt.data.arr;
    mylist("deleteSelections", farr);
  }   
  

};

function showDistances (arr) {
  save.style.display = "inline"
  folder.style.display = 'none';
  choices.style.display = "inline";
  VTList.style.display = "inline";
  let farr = arr;
  mylist("distancesselected", farr);
}

function DisplayDestination(dest) {
  
  folder.style.display = 'none';
  save.style.display = 'inline';
  // verticalSep.style.display='none';

  
  //save.style.display = 'none';
  console.log(`>${dest}<`);
  // let headertext = displayDestBlock.getElementById("header");
  // let bodytext = displayDestBlock.getElementById("copy");
  myPopup.style.display="inline";
  // btnLeft.style.display = "inline";
  //btnRight.style.display ="none";
  // btnLeft.text = "Return";
  btnRight.text ="Confirm"
  // btnLeft.onclick = () => {
  //   sendVal({ command: "previousstate" });
  // }

  btnRight.onclick = () => {
    sendVal({command: "bustimelist"});
    console.log("send");
  }
    if(dest == ''){
      bodytext.text = '';
      headertext.text = "No Buses on Route";
      confirmBack.style.display = 'none';
      btnRight.style.display ="none";
      
  }
  else{
  headertext.text="Confirm Route Destination"
  btnRight.style.display = "inline";
  
  confirmBack.style.display = 'inline'
  bodytext.text = dest;
}
}

// let showtimes = (arr) => {
//   console.log("called");
//   const standardTimes = [];
//   for (let UTCtime of arr) {
//     let time = new Date(UTCtime)
//     let min = time.getUTCMinutes();
//     let hr = time.getUTCHours() - 5;
//     console.log(`${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${min} ${hr < 12 ? 'AM' : 'PM'}`);
//   }

// }

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
  
  error.style.display = 'none';
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
  if(!messaging.peerSocket.wasClean){
    
    error.style.display = 'inline'
  }

  
};

