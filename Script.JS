function startTime() {
      const now = new Date();
      const opts = {timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false};
      const timeString = new Intl.DateTimeFormat('en-GB', opts).format(now);
      const dateParts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Oslo',weekday: 'long',day: '2-digit',month: '2-digit',year: 'numeric'}).formatToParts(now);
      document.getElementById('clock').textContent = timeString;
      const date = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
      const dateString = `${date.weekday} ${date.day}.${date.month}.${date.year}`;
      document.getElementById('date').textContent = dateString;
  setTimeout(startTime, 1000);
}
startTime();



async function fetchWeather(hour) {
  const response = await fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=63.43&lon=10.39");
  const data = await response.json();
  console.log(response);
  const time = data.properties.timeseries[hour].time
  const symbol = data.properties.timeseries[hour].data.next_1_hours.summary.symbol_code
  const temp = data.properties.timeseries[hour].data.instant.details.air_temperature
  console.log(time)
  console.log(symbol);
  console.log(temp);
  const fineTime = time.substring(11,13);
  const weatherText = `weathericons-main/weather/svg/${symbol}.svg`
  document.getElementById(`${hour}time`).textContent = (fineTime)
  document.getElementById(`${hour}weatherSymbol`).innerHTML = `<img src="${weatherText}" style="width:auto;height:10vh;"><img>`
  document.getElementById(`${hour}temperature`).textContent = (temp + "°")
  setTimeout(() => getWeather(hour), 60_000);
}
for (let x = 0; x <= 6; x++) {
  fetchWeather(x);
}



async function fetchBus(stopId, type, ){
  const res = await fetch("https://api.entur.io/journey-planner/v3/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ET-Client-Name": "Ace"
    },
    body: JSON.stringify({
      query: `{
        stopPlace(id: "${stopId}") {
          name
          estimatedCalls(timeRange: 3600, numberOfDepartures: 5) {
            expectedDepartureTime
            destinationDisplay { frontText }
            serviceJourney { line { publicCode } }
          }
        }
      }`
    })
  });
  const data = await res.json();
  console.log(data)
  const stopName = data.data.stopPlace.name
  document.getElementById(`${type}StopName`).textContent = stopName;
  for (let x = 0; x <= 4; x++) {
    const call = data.data.stopPlace.estimatedCalls[x];
    const lineNr = call.serviceJourney.line.publicCode;
    const lineName = call.destinationDisplay.frontText;
    const lineDepart = new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).format(new Date(call.expectedDepartureTime));
    document.getElementById(`${type}${x}busNr`).textContent = lineNr;
    document.getElementById(`${type}${x}busName`).textContent = lineName;
    document.getElementById(`${type}${x}busDepart`).textContent = lineDepart;
  }
  setTimeout(() => fetchBus(stopId, type), 10_000);
}
fetchBus("NSR:StopPlace:41962", "primary");
fetchBus("NSR:StopPlace:43819", "seccondary");
