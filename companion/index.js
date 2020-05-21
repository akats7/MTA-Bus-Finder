import * as messaging from "messaging";
import { settingsStorage } from "settings";
import {localStorage} from "local-storage";



let BustoStop = new Map();
let StopNametoCode = new Map();
let LinetoFull = new Map();
let shortDirectionstoFull = new Map();
let distancetoETA = new Map();
let SelectedBus = '';
let state = 0;
let prevState = [init];
//let prevState = [init, BusStopssend, FindStopssend, displayDestsend, BusDistancessend,ETAsend];
let prevStateArgs = [''];
let SelectedStop = '';
let SelectedBustext = '';
let SelectedStoptext= '';
let cachedRequest = '';

let searchRadius = 500;


// localStorage.clear();
// function initsend (){
//   state=0;
//   sendVal({command:"Init", arr: []}) 
// }
function init() {

  state = 0;
  prevStateArgs= [''];
  prevState = [init];
  BustoStop.clear();
  StopNametoCode.clear();
  LinetoFull.clear();
  SelectedBus = '';
  sendVal({ command: "Init" })
}


function BusStopssend(arr) { //Displays Bus Options on screen in VT list
  // prevState.push(BusStopssend);
  // prevStateArgs.push([args]);
  state = 1;
  //prevStateArgs[state] = [arr];
 
  sendVal({ command: "BusOptions", arr: arr });
}

// function DetermineDirsend(arr) {
//   state = 2;
//   prevStateArgs[state] = [arr];
//   sendVal({ command: "Directions", arr: arr });
// }

function FindStopssend(arr) { // Displays Bus Stop options on screen in VT list
  state = 2;
  // prevState.push(FindStopssend);
  // prevStateArgs.push([arr]);
  //prevStateArgs[state] = [arr];
  console.log("FindStopssend")
  sendVal({
    command: "selectedstops",
    arr: arr
  });
}

function displayDestsend(arr) {
  state = 3;
  // prevState.push(displayDestsend);
  // prevStateArgs.push([arr]);
  console.log(arr);
  //prevStateArgs[state] = [arr];
  sendVal({ command: "StopDestination", arr: [arr] });
}

function BusDistancessend(arr) {
  state = 4;
  // prevState.push(BusDistancessend);
  // prevStateArgs.push([arr]);
  //prevStateArgs[state] = [arr];
  sendVal({ command: "busDistances", arr: arr });
}


function ETAsend(arr){
  state = 5; 
  // prevState.push(ETAsend);
  // prevStateArgs.push([arr]);
  //prevStateArgs[state] =[arr];
  sendVal ({command: "ETAsent", arr: arr});
}

function loadCachesend(arr){
  // prevState.push(loadCachesend);
  // prevStateArgs.push([arr]);
  state = 2;  
  sendVal ({command: "loadStorage", arr: arr});
}

function deleteCachesend(arr){
  // prevState.push(loadCachesend);
  // prevStateArgs.push([arr]);
  state = 2;  
  sendVal ({command: "deleteCache", arr: arr});
}


// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  sendVal({ command: "Init", arr: [] });

};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

messaging.peerSocket.onmessage = async evt => {
  
  //console.log(`App received: ${JSON.stringify(evt)}`);
  /*let promise = new Promise((res, rej) => {
      setTimeout(() => console.log("Now it's done!"), 3000);
    
  });
   promise.then(function(val){console.log("hello")});  
  */

  //console.log(evt.data.BusNum)
  let val = '';
  let str = JSON.stringify(evt.data.command);
  console.log(str);
  str = str.slice(1, -1);

  for (let i = 0; i < str.length; i++) {
    //console.log(str[i]);
  }
  //console.log(str.length);


  if (str === "Init") {

    init();
  }
  else if(str === "Radius"){
    let val =  parseFloat(JSON.stringify(evt.data.data));
    console.log(val);
    searchRadius = 1000 * val;
    init();
    
  }
  
  else if (str === "loadCache"){
    
    let arr = [];
    for(let i = 0; i < localStorage.length && i < 15; i++){
      
      arr.push(localStorage.key(i));
    }
    // for(let num = 0; num < count; num ++){
    // arr.pop();
    // }
    // count++;
    console.log(arr.length);
    if(arr.length > 0){
      prevState.push(loadCachesend);
      prevStateArgs.push([arr]);
      loadCachesend(arr);
    }
  }

  else if (str === "save"){
    if(SelectedBus && SelectedStoptext && localStorage.length < 15){
      localStorage.setItem(`Bus: ${SelectedBus} Stop: ${SelectedStoptext}`, cachedRequest);
    }
  }
  else if (str === "deleteCache"){
    let arr = [];
    SelectedStoptext='';
    SelectedBus='';
    for(let i = 0; i < localStorage.length; i++){
      
      arr.push(localStorage.key(i));
    }
    
    if(arr.length > 0){
      prevState.push(deleteCachesend);
      prevStateArgs.push([arr]);
      deleteCachesend(arr);
    }
  }

  else if (str === "confirm"){
    let removed = evt.data.arr;
    for(let el of removed){
      localStorage.removeItem(el);
    }
    console.log('Deleted');
    prevState.pop()
    prevStateArgs.pop();
    ///////// Remove and call function when refactoring /////////
    let arr = [];
    for(let i = 0; i < localStorage.length; i++){
      
      arr.push(localStorage.key(i));
    }
    
    if(arr.length > 0){
      prevState.push(deleteCachesend);
      prevStateArgs.push([arr]);
      deleteCachesend(arr);
      
  }
  
  else{
    init()
  }

  }

  else if (str === "savedStopSelect") {
    let str = JSON.stringify(evt.data.BusNum).slice(1, -1);
    let req = localStorage.getItem(str);
    fetchTimes(1,req).then(val => {
      displayDest(val);
    });


  }

  else if (str === "previousstate") {

    restorepreviousstate();
  }

  else if (str === "BusStops") {
    //console.log("calling BusStops function");

    //state=1; // state 1
    BusStops();
  }
  else if (str === "BusSelection") {
    str = JSON.stringify(evt.data.BusNum).slice(1, -1);

    SelectedBus = str;
    console.log("Determining Direction");
    //state = 2; //state 2
    //prevStateArgs.push([str]);
    console.log(str);
    FindStops(str);

  }
  else if (str === "FindStops") {
    //state = 3; //state 3
    //prevStateArgs.push([evt]);
    FindStops(evt);

  }
  else if (str === "SelectedStop") {
    //console.log("StopSelected");
    SelectedStoptext = JSON.stringify(evt.data.BusNum).slice(1, -1);
    //val = StopNametoCode.get(JSON.stringify(evt.data.BusNum).slice(1,-1));
    let code = StopNametoCode.get(JSON.stringify(evt.data.BusNum).slice(1, -1));
    let Busfullname = LinetoFull.get(SelectedBus);
    //state = 4; //state 4 
    //prevStateArgs.push([code, Busfullname]);
    console.log("fetchTimes is called");
    fetchTimes(0,code, Busfullname)
    .then(val => {
      displayDest(val);
    });

  }

   else if(str === "bustimelist"){
     let timeslist = [];
     console.log("SELECTEDSTOP")
    
     
     console.log(JSON.stringify(SelectedStop));
     const times = SelectedStop.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;

        for(let time of times){
          if (time.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime) {
            let UTCtime = time.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
            let formDate = new Date(UTCtime)
            let min = formDate.getUTCMinutes();
            
            if (min < 10){
              min = `0${min}`;
            }

            console.log(min);
            let hr = formDate.getUTCHours() - 5;
            let formattedTime = `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${min} ${hr < 12 ? 'AM' : 'PM'}`;
            distancetoETA.set(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText,formattedTime);
          }
          else{
            distancetoETA.set(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText,"TBD");
          }
          timeslist.push(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText);
        }
          // let formatTimes = timeslist.map((UTCtime) => {
          // let time = new Date(UTCtime)
          // let min = time.getUTCMinutes();
          // // console.log(min);
          // let hr = time.getUTCHours() - 5;
          // return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${min} ${hr < 12 ? 'AM' : 'PM'}`;
          // });
          console.log(timeslist);
         
        //sendVal({command:"times", arr: times});
        //prevStateArgs[state]=[formatTimes]
        prevState.push(BusDistancessend);
        prevStateArgs.push([timeslist]);
        BusDistancessend(timeslist);
  

 }

 else if (str=== "distancesselected" ){
        console.log("Distance")
        let str = JSON.stringify(evt.data.BusNum).slice(1,-1);
        console.log(str);
        let EAT = distancetoETA.get(str)
        console.log(EAT);
        let arr = [EAT,str];
        prevState.push(ETAsend);
        prevStateArgs.push([arr]);
        ETAsend(arr);
        

 }

}

function restorepreviousstate() {
  console.log(prevState);
  console.log(prevStateArgs);
  
  if (state !== 0) {
    prevState.pop();
    
    prevStateArgs.pop();
    let fn = prevState[prevState.length - 1];
    let args = prevStateArgs[prevStateArgs.length - 1];
    
    fn(...args);
    // let arr = prevState[state - 1];
    // arr(...prevStateArgs[state - 1]);
    // console.log(arr);
    // console.log(...prevStateArgs[state - 1]);
  }
}


// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  sendVal(data);
};


async function fetchTimes(mode, Stopcode, BusLine) {
  //prevStateArgs[state] = [arguments];
  
  let request = '';

  if (mode === 0){
    var params = {
      key: "?key=c1c48a75-1692-4672-baec-5ae98bc790ec",
      version: "&version=2",
      MonitoringRef: `&MonitoringRef=${Stopcode}`,
      OperatorRef: "&OperatorRef=MTA",
      StopMonitoringDetailLevel: "&StopMonitoringDetailLevel=minimum",
      LineRef: `&LineRef=${BusLine}`
    };

    request = (`https://bustime.mta.info/api/siri/stop-monitoring.json` + params.key + params.version
      + params.MonitoringRef + params.OperatorRef + params.StopMonitoringDetailLevel + params.LineRef).replace("+", "%2B");

    //////////////// Cache Requests ///////////
    //localStorage.setItem(`Bus: ${SelectedBus} Stop: ${SelectedStoptext}`, cachedRequest);

    cachedRequest = request;
  }

  else{
    request = Stopcode;
    
  }
    
    //////////////////////////////////////////
  //console.log(request);
  return fetch(request)
    .then((response) => {
      let stop = response.json();
      return stop;
    })
    .catch(function (error) {
      
    })

}

function displayDest(json) {
  let str = '';
  //if(json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.DestinationName){
  try{  
    str = json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.DestinationName
    SelectedStop = json;
  }

  catch{
    
  }
 // str = json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.DestinationName
  
  console.log(str);
  prevState.push(displayDestsend);
  prevStateArgs.push([str]);
  displayDestsend(str);

}


function FindStops(evt) {

  //state = 3; //state 3
  //prevStateArgs[state] = evt;
  //console.log("Finding Relevant");
  let stops = BustoStop.get(SelectedBus);
  let relevantstops = [];
  //console.log(`Direction: ${evt.data.BusNum}`)
  
  //console.log(dir[0]);
  for (let opts of stops) {

      if(relevantstops.length < 15){
        if(relevantstops.indexOf(opts.name) === -1){
          relevantstops.push(opts.name);
          StopNametoCode.set(opts.name, opts.code);
        }
        else{
          relevantstops.push(`${opts.name} `);
          StopNametoCode.set(`${opts.name} `, opts.code); // need to fix overwriting issue for stops with same name 
        }
    }
  }

  for(let stop of relevantstops){
    console.log(stop);
  }
  prevState.push(FindStopssend);
  prevStateArgs.push([relevantstops]);
  FindStopssend(relevantstops);
  // sendVal({command:"selectedstops", 
  //         arr: relevantstops
  //         });

}

function BusStops() {

  let lat = 40.585018;
  let long = -73.811928;
  let latspan = .01;
  let longspan = .05;
  let radius = 1000;
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  const key = 'c1c48a75-1692-4672-baec-5ae98bc790ec'
  // const URL = `https://bustime.mta.info/api/where/stops-for-location.json?lat=${lat}&lon=${long}&latSpan=${latspan}&lonSpan=${longspan}&key=${key}`;
  const URL = `https://bustime.mta.info/api/where/stops-for-location.json?lat=${lat}&lon=${long}&radius=${searchRadius}&key=${key}`;
  state = 1;

  //fetch("https://Google.com")


  let monitor = '&MonitoringRef=' + "550771";
  let line = '&LineRef=MTABC_' + "Q22";


  fetch(URL)
    .then((response) => {
      /*console.log(JSON.stringify(response.data));
      console.log(response);*/
      return response.json()
    })

    .then((json) => {

      const arr = json.data.stops;
      //console.log(arr);
      for (let st of arr) {
        //console.log(st); // Map route.shortname to arr index which maps it to the object
        let routes = st.routes;
        for (let path of routes) {

          //console.log(path.shortName);

          let temp = BustoStop.get(path.shortName);

          if (temp === undefined) {
            //console.log("hi");
            BustoStop.set(path.shortName, [st]);
            LinetoFull.set(path.shortName, path.id)
          }
          else {
            //console.log("hello");
            temp.push(st);
          }

        }
      }
      let count = 0;
      const keyarr = [];
      let keys = BustoStop.keys();
      //console.log(`key: ${keys.next().value}`);
      let it = keys.next();
      while (count < 15 && it.done === false) {

        // console.log(it.value);
        keyarr.push(it.value);
        it = keys.next();
        count++;
      }
      prevState.push(BusStopssend);
      prevStateArgs.push([keyarr]);
      BusStopssend(keyarr);
      //prevStateArgs[state] = [keyarr];
      //sendVal({command: "BusOptions", arr: keyarr});

      for ([bus,stops] in BustoStop){
        console.log(`${bus}: ${stops}`);
      }

    })
    .catch(error => console.log(error));


}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log(state)
    messaging.peerSocket.send(data);
  }
}