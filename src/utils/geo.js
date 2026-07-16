/**
 * Geospatial utility functions for DonateBridge.
 * Extracted from useMockDB.js to be shared across pages.
 */

/**
 * Calculate Haversine distance between two coordinates in kilometers.
 */
export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate smart match score between a donation and a need.
 * Score = CategoryFit (40%) + Distance (30%) + Urgency (20%) + Freshness (10%)
 */
export function calculateMatchScore(donation, need) {
  if (!donation || !need) {
    return { total: 0, categoryFit: 0, distanceScore: 0, urgencyScore: 0, freshnessScore: 0, distance: 0 };
  }

  const categoryFit = donation.category.toLowerCase() === need.category.toLowerCase() ? 100 : 0;

  const distance = getDistanceInKm(
    donation.location?.lat ?? donation.pickup_lat ?? 0,
    donation.location?.lng ?? donation.pickup_lng ?? 0,
    need.lat ?? 0,
    need.lng ?? 0
  );
  const distanceScore = Math.max(0, 100 - (distance * 5)); // 0km = 100%, 20km = 0%

  let urgencyScore = 30; // Low
  if (need.urgency === 'High') urgencyScore = 100;
  else if (need.urgency === 'Medium') urgencyScore = 70;

  const submittedAt = donation.submittedAt || donation.submitted_at;
  const daysOpen = submittedAt
    ? (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const freshnessScore = Math.max(0, 100 - (daysOpen * 10));

  const total = Math.round(
    (categoryFit * 0.40) +
    (distanceScore * 0.30) +
    (urgencyScore * 0.20) +
    (freshnessScore * 0.10)
  );

  return {
    total,
    categoryFit: Math.round(categoryFit * 0.40),
    distanceScore: Math.round(distanceScore * 0.30),
    urgencyScore: Math.round(urgencyScore * 0.20),
    freshnessScore: Math.round(freshnessScore * 0.10),
    distance: parseFloat(distance.toFixed(1)),
  };
}
