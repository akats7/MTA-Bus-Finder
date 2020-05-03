import * as messaging from "messaging";
import { settingsStorage } from "settings";

let BustoStop = new Map();
let StopNametoCode = new Map();
let LinetoFull = new Map();
let shortDirectionstoFull = new Map();
let SelectedBus = '';
let state = 0;
let prevState = [init,BusStopssend,DetermineDirsend,FindStopssend,BusTimessend];
let prevStateArgs = [''];
let SelectedStop = '';

// function initsend (){
//   state=0;
//   sendVal({command:"Init", arr: []}) 
// }

function BusStopssend (arr){
  
  state = 1; 
  prevStateArgs[state]=[arr];
  sendVal({command: "BusOptions", arr: arr});
}

function DetermineDirsend (arr){
  state=2; 
  prevStateArgs[state]=[arr];
  sendVal({command: "Directions", arr: arr});
}

function FindStopssend (arr) {
 
 state=3; 
 prevStateArgs[state]=[arr];
 sendVal({command:"selectedstops", 
            arr: arr
            });
}

function displayDestsend(arr){
  state = 4;
  prevStateArgs[state]=[arr];
  sendVal({command:"StopDestination",arr: arr});
}

function BusTimessend (arr) {
  state=5;
  prevStateArgs[state]=[arr];
  sendVal({command:"times", arr: arr});
}


// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  sendVal({command:"Init", arr:[]});

};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};


messaging.peerSocket.onmessage = (evt) => {
//console.log(`App received: ${JSON.stringify(evt)}`);
/*let promise = new Promise((res, rej) => {
    setTimeout(() => console.log("Now it's done!"), 3000);
  
});
 promise.then(function(val){console.log("hello")});  
*/
  let val = '';
  let str = JSON.stringify(evt.data.command);
  str = str.slice(1,-1);
  
  for(let i = 0; i<str.length;i++){
    //console.log(str[i]);
  }
  //console.log(str.length);
  
  
  if(str==="Init"){
     
      init();
     }
  else if(str==="previousstate"){
   
    restorepreviousstate();
  }
 
  else if(str==="BusStops"){
    //console.log("calling BusStops function");
    
    //state=1; // state 1
    BusStops();
  }
  else if(str==="BusSelection"){
    str=JSON.stringify(evt.data.BusNum).slice(1,-1);
   
    SelectedBus = str;
    console.log("Determining Direction");
    state=2; //state 2
    prevStateArgs.push([str]);
    console.log(str);
    DetermineDir(str);
   
  }
  else if(str==="FindStops"){
    state=3; //state 3
    prevStateArgs.push([evt]);
    FindStops(evt);
    
  }
  else if(str==="SelectedStop"){
    //console.log("StopSelected");
    //val = StopNametoCode.get(JSON.stringify(evt.data.BusNum).slice(1,-1));
    let code = StopNametoCode.get(JSON.stringify(evt.data.BusNum).slice(1,-1));
    let Busfullname = LinetoFull.get(SelectedBus); 
    state=4; //state 4 
    prevStateArgs.push([code,Busfullname]);
    console.log("fetchTimes is called");
    selectedStop = fetchTimes(code,Busfullname);
    displayDest(selectedStop);

  }

};

// function reset(){
//   prevstate[0](prevStateArgs[0]);
// }

function restorepreviousstate(){
  if(state!==0){
    let arr = prevState[state-1];
    arr(...prevStateArgs[state-1]);
}
  }  
  

// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  //console.log("hi");
  sendVal(data);
};


function fetchTimes(Stopcode,BusLine){
    state=4; //state 4 
    prevStateArgs[state]=[arguments]
    var params = {
          key: "?key=c1c48a75-1692-4672-baec-5ae98bc790ec",
          version: "&version=2",
          MonitoringRef: `&MonitoringRef=${Stopcode}`,
          OperatorRef:"&OperatorRef=MTA",
          StopMonitoringDetailLevel:"&StopMonitoringDetailLevel=minimum",
          LineRef:`&LineRef=${BusLine}`
      };

    const request = `https://bustime.mta.info/api/siri/stop-monitoring.json`+ params.key + params.version
    + params.MonitoringRef + params.OperatorRef + params.StopMonitoringDetailLevel+params.LineRef;

      //console.log(request);
      fetch(request)
      .then(response => {
      
          return response.json();

      })
      .catch(function(error){
        console.log(error);
    })

function displayDest(json){
  
  displayDestsend(json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.DestinationName);

}

      // .then(json => {
      //     //let = null;
      //     //console.log(json);
      //     const times = json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
          
          
      //     for(let time of times){
      //       var ETA=time.MonitoredVehicleJourney.MonitoredCall;
      //       //console.log(time.MonitoredVehicleJourney.MonitoredCall);
      //       ETA= ETA.ExpectedArrivalTime;
      //       if(ETA){
      //         //console.log(ETA);
      //     }}
          
      //     //sendVal({command:"times", arr: times});
      //     prevStateArgs[state]=[times]
      //     BusTimessend(times);
          
      // })
      // .catch(function(error){
      //     console.log(error);
      // })

      }

function DetermineDir(Bus){
  //let Directions = {};
 
  state=2; //state 2
  prevStateArgs[state]=Bus;
  SelectedBus= Bus;
 let Dir = []; 
 let stops = BustoStop.get(Bus);
 
  for (let stop of stops){
    
      if(Dir.indexOf(stop.direction)===-1){
        Dir.push(stop.direction);
        console.log(stop.direction);
      }
  } 
  

 for(let [index, Element] of Dir.entries()){
   //console.log("hello");
   switch(Element){
     case 'E':
       Dir[index] = "East";
       shortDirectionstoFull.set("East",'E')
       break;
     case 'W':
       Dir[index] = "West";
       shortDirectionstoFull.set("West",'W')
       break;
     case 'N':
     Dir[index] = "North";
     shortDirectionstoFull.set("North",'N')
     break;
     case 'S':
       Dir[index] = "South";
     shortDirectionstoFull.set("South",'S')
       break;
     case 'NE':
       Dir[index] = "NorthEast";
       shortDirectionstoFull.set("NorthEast",'NE')
       break;
     case 'NW':
       Dir[index] = "NorthWest";
       shortDirectionstoFull.set("NorthWest",'NW')
       break;
     case 'SE':
       Dir[index] = "SouthEast";
       shortDirectionstoFull.set("SouthEast",'SE')
     break;
     case 'SW':
       Dir[index] = "SouthWest";
       shortDirectionstoFull.set("SouthWest",'SW')
       break;
       
   }
 }
  
  for(let sample of Dir){
    console.log(sample);
  }
  //console.log("hello");
  
    DetermineDirsend(Dir);
  // if(stops[0].direction==='E'||stops[0].direction==='W'){
  //   Dir1="East";
  //   Dir2="West";
  // }
  // else{
  //   Dir1="North";
  //   Dir2='South';
  // }
  
  
    //let arr = [Dir1,Dir2];
  
  
    //let arr = [Dir1,Dir2];
// for( let stop of stops){
  //   console.log(stop.code);
  //   arr.push(stop)
  // }

  //prevStateArgs[state]=[Dir1,Dir2];
  //sendVal(ValSend);
}

  function init(){
    
    //sendVal({command:"Init", arr: []})
    state=0;
    //prevStateArgs[state]=[];
    BustoStop.clear();
    StopNametoCode.clear();
    LinetoFull.clear();
    SelectedBus = '';
    sendVal({command:"Init"})
  }


  function FindStops(evt){
    
    state=3; //state 3
    prevStateArgs[state]=evt;
    //console.log("Finding Relevant");
    let stops = BustoStop.get(SelectedBus);
    let relevantstops = [];
    console.log(`Direction: ${evt.data.BusNum}`)
    let directions = shortDirectionstoFull.get(evt.data.BusNum);
    //console.log(dir[0]);
    for(let opts of stops){
      //console.log(`Bus: ${opts.routes.id} Direction:${opts.direction}`);
      if(opts.direction===directions){
        
        //console.log(evt.data.direction[0]);
                                                                                                                                                                      relevantstops.push(opts.name);
        
        StopNametoCode.set(opts.name,opts.code);
        //console.log(relevantstops);
      }
    }
    
    // for(let stop of relevantstops){
    //   console.log(stop);
    // }
    prevStateArgs[state]=[relevantstops];
    FindStopssend(relevantstops);
    // sendVal({command:"selectedstops", 
    //         arr: relevantstops
    //         });
    
  }

  function BusStops(){
     
      let lat = 40.585;
      let long = -73.812;
      let latspan = .01;
      let longspan = .05;
      const proxy ='https://cors-anywhere.herokuapp.com/';   
      const key = 'c1c48a75-1692-4672-baec-5ae98bc790ec'
      const URL = `https://bustime.mta.info/api/where/stops-for-location.json?lat=${lat}&lon=${long}&latSpan=${latspan}&lonSpan=${longspan}&key=${key}`;
      state = 1; 

      //fetch("https://Google.com")
      

        let monitor = '&MonitoringRef=' + "550771";
        let line = '&LineRef=MTABC_' + "Q22";


        fetch(URL)
      .then((response) => {
          /*console.log(JSON.stringify(response.data));
          console.log(response);*/
          return response.json()})

      .then((json) => {

         const arr = json.data.stops;
         //console.log(arr);
          for(let st of arr){
           //console.log(st); // Map route.shortname to arr index which maps it to the object
           let routes=st.routes;
             for(let path of routes){ 

               //console.log(path.shortName);

               let temp = BustoStop.get(path.shortName);

                 if(temp === undefined){
                   //console.log("hi");
                 BustoStop.set(path.shortName,[st]);
                 LinetoFull.set(path.shortName,path.id)
                 }
                 else{
                   //console.log("hello");
                   temp.push(st);
                 }

             }
         }
          const keyarr = [];
          let keys = BustoStop.keys();
          //console.log(`key: ${keys.next().value}`);
          let it = keys.next();
          while(it.done === false){

           // console.log(it.value);
            keyarr.push(it.value);
            it = keys.next();
          }
          BusStopssend(keyarr);
          prevStateArgs[state]=[keyarr];
          //sendVal({command: "BusOptions", arr: keyarr});
          

        })
      .catch(error => console.log(error));


  }

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

 