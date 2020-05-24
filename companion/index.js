import * as messaging from "messaging";
import { localStorage } from "local-storage";
import { geolocation } from "geolocation";


let BustoStop = new Map();
let StopNametoCode = new Map();
let LinetoFull = new Map();
let distancetoETA = new Map();
let SelectedBus = '';
let prevState = ['Init'];
let prevStateArgs = [''];
let SelectedStop = '';
let SelectedStoptext = '';
let cachedRequest = '';
let searchRadius = 500;
let latitude = 40.585018;
let longitude = -73.811928;;

Number.prototype.mod = function(x) {
  return ((this % x) + x) % x;
}

messaging.peerSocket.onmessage = async evt => {

  let val = evt.data.data;
  let str = JSON.stringify(evt.data.command);
  str = str.slice(1, -1);
  companionHandler[str](val);
}

let companionHandler = {

  Init() {
    runInit();
  },
  loadCache() {
    runLoadCache();
  },
  saveToCache() {
    runSaveToCache();
  },
  setRadius(data) {
    let rad = parseFloat(data);
    searchRadius = 1000 * rad;
    runInit();
  },
  deleteCache() {
    runDeleteCache();
  },
  confirmDelete(data) {
    runConfirmDelete(data)
  },
  selectSavedStop(data) {
    let str = JSON.stringify(data).slice(1, -1);
    let req = localStorage.getItem(str);
    fetchTimes(1, req).then(val => {
      runDisplayDestination(val);
    });
  },
  previousState() {
    runPreviousState();
  },
  findLocalStops() {
    runFindLocalStops();
  },
  findRelevantStops(data) {
    let str = JSON.stringify(data).slice(1, -1);
    SelectedBus = str;
    runFindRelevantStops(str);
  },
  displayDestination(data) {

    SelectedStoptext = JSON.stringify(data).slice(1, -1);
    let code = StopNametoCode.get(JSON.stringify(data).slice(1, -1));
    let Busfullname = LinetoFull.get(SelectedBus);

    fetchTimes(0, code, Busfullname)
      .then(val => {
        runDisplayDestination(val);
      });
  },
  listofTimes() {
    runListOfTimes();
  },
  displayETA(data) {
    let str = JSON.stringify(data);
    runDisplayETA(str);
  }
}

function runInit() {

  prevStateArgs = [''];
  prevState = ['Init'];
  BustoStop.clear();
  StopNametoCode.clear();
  LinetoFull.clear();
  SelectedBus = '';
  sendVal('Init')
  geolocation.getCurrentPosition(locationSuccess, locationError, {
    timeout: 60 * 1000
  });
}


function runDisplayETA(data) {
  let str = data.slice(1, -1);
  let EAT = distancetoETA.get(str)
  let arr = [EAT, str];
  prevState.push('ETAsent');
  prevStateArgs.push([arr]);
  sendVal('ETAsent', arr);
}

function runLoadCache() {
  SelectedStoptext = '';
  SelectedBus = '';
  let arr = [];
  for (let i = 0; i < localStorage.length && i < 15; i++) {

    arr.push(localStorage.key(i));
  }
  if (arr.length > 0) {
    prevState.push('loadCache');
    prevStateArgs.push([arr]);
    sendVal('loadCache', arr);
  }
}

function runSaveToCache() {
  if (SelectedBus && SelectedStoptext && localStorage.length < 15) {
    localStorage.setItem(`Bus: ${SelectedBus} Stop: ${SelectedStoptext}`, cachedRequest);
  }
}

function runDeleteCache() {
  let arr = [];

  for (let i = 0; i < localStorage.length; i++) {

    arr.push(localStorage.key(i));
  }

  if (arr.length > 0) {
    prevState.push('deleteCache');
    prevStateArgs.push([arr]);
    sendVal('deleteCache', arr);
  }
}

function runConfirmDelete(data) {
  let removed = data;

  for (let el of removed) {
    console.log(el);
    localStorage.removeItem(el);
  }
  prevStateArgs.pop();
  let arr = [];
  for (let i = 0; i < localStorage.length; i++) {

    arr.push(localStorage.key(i));
  }
  if (arr.length > 0) {
    prevStateArgs.push([arr]);
    sendVal('deleteCache', arr);

  }
  else {
    runInit()
  }
}
async function fetchTimes(mode, Stopcode, BusLine) {

  let request = '';
  if (mode === 0) {
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
    cachedRequest = request;
  }
  else {
    request = Stopcode;

  }
  return fetch(request)
    .then((response) => {
      let stop = response.json();
      return stop;
    })
    .catch(function (error) {

    })
}

function runDisplayDestination(json) {
  let str = '';
  try {
    str = json.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.DestinationName
    SelectedStop = json;
  }
  catch (err) {
    console.log(err);
  }
  finally {
    console.log(str);
    prevState.push('StopDestination');
    prevStateArgs.push([str]);
    sendVal('StopDestination', str);
  }
}

function runFindRelevantStops(evt) {
  let stops = BustoStop.get(SelectedBus);
  let relevantstops = [];
  
  for (let opts of stops) {
    if (relevantstops.length < 15) {
      if (relevantstops.indexOf(opts.name) === -1) {
        relevantstops.push(opts.name);
        StopNametoCode.set(opts.name, opts.code);
      }
      else {
        relevantstops.push(`${opts.name} `);
        StopNametoCode.set(`${opts.name} `, opts.code);
      }
    }
  }
  prevState.push('selectedstops');
  prevStateArgs.push([relevantstops]);
  sendVal('selectedstops', relevantstops);
}

function runFindLocalStops() {
  let lat = latitude;
  let long = longitude;
  const key = 'c1c48a75-1692-4672-baec-5ae98bc790ec'
  const URL = `https://bustime.mta.info/api/where/stops-for-location.json?lat=${lat}&lon=${long}&radius=${searchRadius}&key=${key}`;

  fetch(URL)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      const arr = json.data.stops;
      for (let st of arr) {
        let routes = st.routes;
        for (let path of routes) {
          let temp = BustoStop.get(path.shortName);
          if (temp === undefined) {
            BustoStop.set(path.shortName, [st]);
            LinetoFull.set(path.shortName, path.id)
          }
          else {
            temp.push(st);
          }
        }
      }
      let count = 0;
      const keyarr = [];
      let keys = BustoStop.keys();
      let it = keys.next();
      while (count < 15 && it.done === false) {
        keyarr.push(it.value);
        it = keys.next();
        count++;
      }
      prevState.push('BusOptions');
      prevStateArgs.push([keyarr]);
      sendVal('BusOptions', keyarr)
    })
    .catch(error => console.log(error));
}

function runListOfTimes() {

  let timeslist = [];
  const times = SelectedStop.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
  for (let time of times) {
    if (time.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime) {
      let UTCtime = time.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
      let formDate = new Date(UTCtime)
      let min = formDate.getUTCMinutes();

      if (min < 10) {
        min = `0${min}`;
      }

      let hr = formDate.getUTCHours() - 4;
      let formattedTime = `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr.mod(12)}:${min} ${hr < 12 ? 'AM' : 'PM'}`;
      distancetoETA.set(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText, formattedTime);
    }
    else {
      distancetoETA.set(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText, "TBD");
    }
    timeslist.push(time.MonitoredVehicleJourney.MonitoredCall.ArrivalProximityText);
  }
  prevState.push('busDistances');
  prevStateArgs.push([timeslist]);

  sendVal('busDistances', timeslist);
}

function locationSuccess(position) {
  console.log(
    "Latitude: " + position.coords.latitude,
    "Longitude: " + position.coords.longitude
  );
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}

function runPreviousState() {

  if (prevState[prevState.length - 1] !== 'Init') {
    prevState.pop();
    prevStateArgs.pop();
    let fn = prevState[prevState.length - 1];
    let args = prevStateArgs[prevStateArgs.length - 1];
    if (prevState.length == 1) {
      runInit();
    }
    sendVal(fn, ...args);
  }
}
// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  runInit();

};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

function sendVal(comm, data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: comm, arr: data });
  }
}





