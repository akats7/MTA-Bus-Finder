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
let previousstate = document.getElementById("btn-br");
let reset = document.getElementById("btn-tr");
let VTList = document.getElementById("my-list");
let btnLeft = document.getElementById("btnLeft");
let btnRight = document.getElementById("btnRight");
let displayDestBlock = document.getElementById("textblock");
let displayRoute = true 
let state = '';

VTList.style.display="none";
myPopup.style.display="none";
list.style.display="none";
//displayDestBlock.style.display="none";



function directionbuttons(arr){
    myPopup.style.display = "inline";
    let btnLeft = myPopup.getElementById("btnLeft");
    let btnRight = myPopup.getElementById("btnRight");
    btnLeft.text=arr[0];
    btnRight.text=arr[1];
    btnLeft.onclick = function(evt) {
      myPopup.style.display = "none";
      sendVal({command: "FindStops",direction: arr[0]})
    }
    btnRight.onclick = function(evt) {
    myPopup.style.display = "none";
    sendVal({command: "FindStops",direction: arr[1]})
  }
  }


function mylist(str,array){
    let NUM_ELEMS;
    if(array.length < 11){
       NUM_ELEMS= array.length;
    }
    else{
        NUM_ELEMS=10;
    }
    let i=0;
    VTList.delegate = {
    getTileInfo: function(index) {
    return {
      type: "my-pool",
      value: state==="one" ? "one" : state==="two" ? "two" : "three",
      index: index
    };
  },
    configureTile: function(tile, info) {
      if (info.type == "my-pool") {
        tile.getElementById("text").text = `${array[i++]}`;
        let touch = tile.getElementById("touch-me");
        touch.onclick = evt => {
            console.log(tile.getElementById("text").text)
            sendVal({command: str,BusNum:tile.getElementById("text").text})
            console.log(`touched: ${info.index}`);
            VTList.style.display="none";
        };
      }
    }
  };
VTList.length = NUM_ELEMS;
}

function mylist2(array){
    let NUM_ELEMS = array.length;

    let i=0;
      VTList.delegate = {
      getTileInfo: function(index) {
          return {
            type: "my-pool",
            value: "Menu item",
            index: index
        };
      },
      configureTile: function(tile, info) {
        if (info.type == "my-pool") {
           tile.getElementById("text").style.fontSize = "25px";
           tile.getElementById("text").text = `${array[i++]}`;
           let touch = tile.getElementById("touch-me");
           touch.onclick = evt => {
                sendVal({command: "BusSelection",BusNum:tile.getElementById("text").text})
                console.log(`touched: ${info.index}`);
                VTList.style.display="none";
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

reset.onclick = evt => {

  sendVal({command: "Init"});
} 

mybutton.onclick = async function(evt) {
  
  firstbutton.style.display="none";
  let data = {
          command: 'BusStops', 

      };
     
    sendVal(data);


  }

previousstate.onclick = evt => {
    console.log("previous")
    sendVal({command: "previousstate"});
};

// Message is received
messaging.peerSocket.onmessage = evt => {
  let str = JSON.stringify(evt.data.command);
  str = str.slice(1,-1);
   
  
  if(str==="Init"){ 
   
   firstbutton.style.display="inline";
   VTList.style.display="none";
    
  }
  else if(str==="BusOptions"){
    myPopup.style.display = "none";
    choices.style.display="inline";
    VTList.style.display="inline";
    
    let arr = evt.data.arr;
    mylist("BusSelection",arr);
  }
  else if(str==="Directions"){
    console.log("Recieved");
    VTList.style.display="inline";
    mylist("FindStops",evt.data.arr);
    //directionbuttons(evt.data.arr);
  }
  else if(str==="selectedstops"){
    choices.style.display="inline";
    VTList.style.display="inline";
    let arr = evt.data.arr;
    console.log("Selected Stops");  
    mylist("SelectedStop",arr);
  }
  else if(str==="StopDestination"){
    btnLeft.style.display = "inline";
    btnRight.style.display = "inline";
    DisplayDestination(arr);
  }
  else if(str==="times"){
    console.log("times sent over");
    showtimes(evt.data.arr);
  }
};

function DisplayDestination(dest){
  btnLeft.style.display = "inline";
  btnRight.style.display = "inline";
  displayDestBlock.style.display="inline"
  btnRight.text = "Confirm";
  btnLeft.text = "Return";
  displayDestBlock.text=dest;
}

let showtimes = (arr) => {
  console.log("called");
  const standardTimes = [];
      for(let UTCtime of arr){
        let time = new Date(UTCtime)
        let min = time.getUTCMinutes();
        let hr = time.getUTCHours()-5;
        console.log(`${hr===0 ? 12 : hr > 12 ? hr-12 : hr}:${min} ${hr<12 ? 'AM' : 'PM'}`);
      }     
     
}

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

 