const ROUTE = {};

ROUTE.haversine = function (lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

ROUTE.timeToMinutes = function (t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

ROUTE.minutesToTime = function (m) {
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

ROUTE.calculate = function (priority, departureTime) {
  const clients = [...DAMM.clients];
  const visited = [];
  const unvisited = [...clients];
  let current = { lat: DAMM.ORIGIN.lat, lng: DAMM.ORIGIN.lng, name: DAMM.ORIGIN.name };
  let currentTime = ROUTE.timeToMinutes(departureTime);
  const SPEED = 40;
  const STOP_TIME = 10;
  const totalDistance = 0;

  while (unvisited.length > 0) {
    let best = null;
    let bestDist = Infinity;
    let bestScore = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const c = unvisited[i];
      const dist = ROUTE.haversine(current.lat, current.lng, c.lat, c.lng);
      let score = dist;

      if (priority === 'time') {
        const wStart = ROUTE.timeToMinutes(c.timeWindow.start);
        const arrival = currentTime + dist / SPEED * 60;
        const waitPenalty = arrival < wStart ? (wStart - arrival) * 2 : 0;
        const latePenalty = arrival > ROUTE.timeToMinutes(c.timeWindow.end) ? (arrival - ROUTE.timeToMinutes(c.timeWindow.end)) * 5 : 0;
        score = dist + waitPenalty + latePenalty;
      } else if (priority === 'priority') {
        score = dist / c.priority;
      } else if (priority === 'balanced') {
        const wStart = ROUTE.timeToMinutes(c.timeWindow.start);
        const arrival = currentTime + dist / SPEED * 60;
        const timePenalty = arrival < wStart ? (wStart - arrival) : 0;
        score = dist * (1 - c.priority * 0.1) + timePenalty * 0.5;
      }

      if (score < bestScore) {
        bestScore = score;
        best = c;
        bestDist = dist;
      }
    }

    const travelTime = bestDist / SPEED * 60;
    currentTime += travelTime;
    if (currentTime < ROUTE.timeToMinutes(best.timeWindow.start)) {
      currentTime = ROUTE.timeToMinutes(best.timeWindow.start);
    }
    visited.push({ client: best, distance: bestDist, arrivalTime: ROUTE.minutesToTime(currentTime) });
    current = { lat: best.lat, lng: best.lng, name: best.name };
    unvisited.splice(unvisited.indexOf(best), 1);
    currentTime += STOP_TIME;
  }

  const returnDist = ROUTE.haversine(current.lat, current.lng, DAMM.ORIGIN.lat, DAMM.ORIGIN.lng);
  visited.push({ client: null, distance: returnDist, arrivalTime: ROUTE.minutesToTime(currentTime + returnDist / SPEED * 60) });

  let totalDist = 0;
  const stops = visited.map((s, i) => {
    totalDist += s.distance;
    return {
      order: i + 1,
      client: s.client,
      distance: s.distance,
      cumulativeDistance: totalDist,
      arrivalTime: s.arrivalTime
    };
  });

  const totalTime = ROUTE.timeToMinutes(stops[stops.length - 1].arrivalTime) - ROUTE.timeToMinutes(departureTime);

  return {
    stops: stops,
    totalDistance: totalDist,
    totalTime: totalTime,
    numStops: clients.length,
    priority: priority,
    departure: departureTime
  };
};

ROUTE.getRouteLine = function (route) {
  const coords = [[DAMM.ORIGIN.lat, DAMM.ORIGIN.lng]];
  route.stops.forEach(s => {
    if (s.client) coords.push([s.client.lat, s.client.lng]);
  });
  coords.push([DAMM.ORIGIN.lat, DAMM.ORIGIN.lng]);
  return coords;
};

ROUTE.getRouteBounds = function (route) {
  const lats = [DAMM.ORIGIN.lat];
  const lngs = [DAMM.ORIGIN.lng];
  route.stops.forEach(s => {
    if (s.client) { lats.push(s.client.lat); lngs.push(s.client.lng); }
  });
  return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
};
