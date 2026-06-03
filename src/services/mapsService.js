const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: process.env.GOOGLE_MAPS_API_KEY }
    });
    const result = response.data.results[0];
    if (!result) return null;
    return { lat: result.geometry.location.lat, lng: result.geometry.location.lng };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

const getDistanceMatrix = async (origins, destinations) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
        destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Distance matrix error:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress, getDistanceMatrix };
