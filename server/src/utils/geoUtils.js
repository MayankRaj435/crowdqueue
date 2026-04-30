const createGeoPoint = (longitude, latitude) => ({
  type: 'Point',
  coordinates: [parseFloat(longitude), parseFloat(latitude)],
});

const metersToRadians = (meters) => meters / 6378100;

module.exports = { createGeoPoint, metersToRadians };
