/**
 * Routing utility using Open Source Routing Machine (OSRM) API
 * with fallback for geodesic estimation and turn-by-turn maneuvers.
 */

import { getDistanceInKm } from './geo';

/**
 * Fetch detailed route polyline and turn-by-turn instructions from OSRM.
 * @param {Array<number>} origin [lat, lng]
 * @param {Array<number>} destination [lat, lng]
 * @param {string} profile 'driving' | 'walking' | 'bicycling'
 */
export async function fetchOSRMRoute(origin, destination, profile = 'driving') {
  if (!origin || !destination || origin.length < 2 || destination.length < 2) {
    return null;
  }

  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  // Map travel profile to OSRM API profiles: 'driving', 'walking', 'bike'
  let osrmProfile = 'driving';
  if (profile === 'walking') osrmProfile = 'foot';
  if (profile === 'bicycling' || profile === 'cycling') osrmProfile = 'bike';

  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('OSRM API response not OK');

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found from OSRM');
    }

    const route = data.routes[0];
    // OSRM coordinates are [lng, lat], Leaflet polyline requires [lat, lng]
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

    // Parse turn-by-turn steps
    const steps = [];
    if (route.legs && route.legs[0] && route.legs[0].steps) {
      route.legs[0].steps.forEach((step, idx) => {
        if (!step.maneuver) return;
        const text = formatStepInstruction(step, idx === route.legs[0].steps.length - 1);
        steps.push({
          id: idx,
          instruction: text,
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          distance: step.distance, // meters
          duration: step.duration, // seconds
          location: [step.maneuver.location[1], step.maneuver.location[0]]
        });
      });
    }

    return {
      coordinates,
      distanceKm: (route.distance / 1000).toFixed(2),
      durationMins: Math.ceil(route.duration / 60),
      steps,
      isFallback: false
    };
  } catch (err) {
    console.warn('OSRM routing fetch failed or timed out, using fallback path generator:', err.message);
    return createFallbackRoute(origin, destination, profile);
  }
}

/**
 * Fallback route generation when OSRM is unreachable
 */
function createFallbackRoute(origin, destination, profile) {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;
  const directDistKm = getDistanceInKm(lat1, lng1, lat2, lng2);

  // Estimate speed based on mode
  let speedKmH = 30; // driving
  if (profile === 'walking') speedKmH = 5;
  if (profile === 'bicycling' || profile === 'cycling') speedKmH = 15;

  const durationMins = Math.max(1, Math.ceil((directDistKm / speedKmH) * 60));

  // Generate interpolated curve points between origin and destination to mimic a route
  const pointsCount = 10;
  const coordinates = [];
  
  // Subtle curve offsets for fallback path visualization
  const latDiff = lat2 - lat1;
  const lngDiff = lng2 - lng1;
  const perpLat = -lngDiff * 0.15;
  const perpLng = latDiff * 0.15;

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const curveFactor = Math.sin(t * Math.PI); // max curve at middle
    const interpLat = lat1 + latDiff * t + perpLat * curveFactor;
    const interpLng = lng1 + lngDiff * t + perpLng * curveFactor;
    coordinates.push([interpLat, interpLng]);
  }

  const steps = [
    {
      id: 0,
      instruction: `Head towards destination along primary access route`,
      distance: Math.round((directDistKm * 1000) * 0.4),
      duration: Math.round((durationMins * 60) * 0.4),
      location: origin
    },
    {
      id: 1,
      instruction: `Continue straight for ${(directDistKm * 0.6).toFixed(1)} km`,
      distance: Math.round((directDistKm * 1000) * 0.6),
      duration: Math.round((durationMins * 60) * 0.6),
      location: [(lat1 + lat2) / 2, (lng1 + lng2) / 2]
    },
    {
      id: 2,
      instruction: `Arrive at target location`,
      distance: 0,
      duration: 0,
      location: destination
    }
  ];

  return {
    coordinates,
    distanceKm: (directDistKm * 1.25).toFixed(2), // account for road curvature
    durationMins,
    steps,
    isFallback: true
  };
}

/**
 * Format step maneuver instructions into clean readable sentences
 */
function formatStepInstruction(step, isLast) {
  if (isLast) return 'Arrive at destination';
  
  const type = step.maneuver.type || '';
  const modifier = step.maneuver.modifier || '';
  const street = step.name ? `onto ${step.name}` : '';
  const dist = step.distance > 1000 
    ? `${(step.distance / 1000).toFixed(1)} km` 
    : `${Math.round(step.distance)} m`;

  let action = 'Proceed';
  if (type === 'turn') {
    action = modifier ? `Turn ${modifier}` : 'Turn';
  } else if (type === 'new name') {
    action = 'Continue';
  } else if (type === 'depart') {
    action = 'Head';
  } else if (type === 'arrive') {
    action = 'Arrive at destination';
  } else if (type === 'roundabout' || type === 'rotary') {
    action = 'Take roundabout';
  } else if (modifier) {
    action = `Bear ${modifier}`;
  }

  return `${action} ${street} (${dist})`.trim();
}

/**
 * Helper to calculate estimated carbon emission saved
 */
export function calculateCarbonSaved(distanceKm, category = 'General') {
  const dist = parseFloat(distanceKm) || 1;
  let multiplier = 0.5;
  const c = category.toLowerCase();
  if (c.includes('food')) multiplier = 0.75;
  if (c.includes('book') || c.includes('school')) multiplier = 0.4;
  if (c.includes('medical') || c.includes('equipment')) multiplier = 0.85;
  if (c.includes('cloth') || c.includes('blanket')) multiplier = 0.6;

  return (dist * multiplier).toFixed(1);
}
