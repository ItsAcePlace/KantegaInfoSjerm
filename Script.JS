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



data = fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=63.43&lon=10.39", {
  headers: {
    "User-Agent": "Ace",
    "Accept": "application/json",
    
  }
})
console.log(data.json)




async function fetchBus(stopId, titleId, bodyId){
  const busBody = document.getElementById(bodyId);

  try {
    const res = await fetch("https://api.entur.io/journey-planner/v3/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": "Ace"
      },
      body: JSON.stringify({
        query: `{
          # Look up this bus stop using its NSR stop-place identifier.
          stopPlace(id: "${stopId}") {
            # Request the stop name for the heading.
            name
            # Request up to 5 estimated departures over the next hour.
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

    const stop = data.data.stopPlace; 
    document.getElementById(titleId).textContent = stop.name; 

    // Turn every departure into a table row.
    const rows = stop.estimatedCalls.map(call => {
      const row = document.createElement("tr");
      const departureTime = new Date(call.expectedDepartureTime).getTime();
      const minutesUntilDeparture = Math.max(0, Math.ceil((departureTime - Date.now()) / 60_000));
      let departureCountdown;
      if (Number.isNaN(departureTime)) {
        departureCountdown = "Time unavailable";
      } else if (minutesUntilDeparture > 10) {
        departureCountdown = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Oslo",
          hour: "2-digit",
          minute: "2-digit"
        }).format(new Date(departureTime));
      } else if (minutesUntilDeparture === 0) {
        departureCountdown = "Now";
      } else {
        departureCountdown = `${minutesUntilDeparture} min`;
      }
      const values = [
        call.serviceJourney?.line?.publicCode ?? "—",
        call.destinationDisplay?.frontText ?? "—",
        departureCountdown
      ];
      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      }
      return row;
    });
    busBody.replaceChildren(...rows);
    if (rows.length === 0) {
      busBody.textContent = "No departures found.";
    }
  } catch (error) {
    console.error("Could not load bus departures:", error);
  } finally {
    setTimeout(() => fetchBus(stopId, titleId, bodyId), 10_000);
  }
}

fetchBus("NSR:StopPlace:44029", "bus-title", "bus-table");
fetchBus("NSR:StopPlace:41587", "bus-title-secondary", "bus-table-secondary");
