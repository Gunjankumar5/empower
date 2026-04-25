/**
 * Geofencing Service
 * Handles geofence calculations and zone checking
 */

const Geofence = require('../models/Geofence');

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * Check if point is inside circle
 */
const isPointInCircle = (pointLat, pointLng, centerLat, centerLng, radius) => {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radius;
};

/**
 * Check if point is inside polygon (Ray casting algorithm)
 */
const isPointInPolygon = (pointLat, pointLng, polygon) => {
  let isInside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect = (yi > pointLng) !== (yj > pointLng) && 
                      pointLat < ((xj - xi) * (pointLng - yi)) / (yj - yi) + xi;
    
    if (intersect) isInside = !isInside;
  }

  return isInside;
};

/**
 * Check if user location is inside any geofence
 */
const checkUserLocation = async (userId, lat, lng) => {
  try {
    // Get all active geofences
    const geofences = await Geofence.find({ isActive: true });
    
    const results = {
      inside: [],
      outside: [],
    };

    for (const geofence of geofences) {
      // Check if geofence applies to this user
      const appliesTo = geofence.isPublic || 
                       (geofence.applicableUsers && 
                        geofence.applicableUsers.some(id => id.toString() === userId.toString()));
      
      if (!appliesTo) continue;

      let isInside = false;
      
      if (geofence.shape === 'circle') {
        isInside = isPointInCircle(
          lat,
          lng,
          geofence.center.lat,
          geofence.center.lng,
          geofence.radius
        );
      } else if (geofence.shape === 'polygon' && geofence.polygon?.length > 0) {
        isInside = isPointInPolygon(lat, lng, geofence.polygon);
      }

      if (isInside) {
        results.inside.push({
          id: geofence._id,
          name: geofence.name,
          type: geofence.type,
          description: geofence.description,
        });
      } else {
        results.outside.push({
          id: geofence._id,
          name: geofence.name,
          type: geofence.type,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error checking user location:', error);
    throw error;
  }
};

/**
 * Get geofences applicable to a user
 */
const getUserGeofences = async (userId) => {
  return Geofence.find({
    isActive: true,
    $or: [
      { isPublic: true },
      { applicableUsers: userId }
    ]
  }).select('name description type center radius shape color');
};

/**
 * Create a geofence
 */
const createGeofence = async (geofenceData, adminId) => {
  const geofence = new Geofence({
    ...geofenceData,
    createdBy: adminId,
  });
  return geofence.save();
};

/**
 * Update a geofence
 */
const updateGeofence = async (geofenceId, updateData) => {
  return Geofence.findByIdAndUpdate(
    geofenceId,
    { ...updateData, updatedAt: new Date() },
    { new: true }
  );
};

/**
 * Delete a geofence
 */
const deleteGeofence = async (geofenceId) => {
  return Geofence.findByIdAndDelete(geofenceId);
};

/**
 * Get all geofences for admin
 */
const getAllGeofences = async () => {
  return Geofence.find().populate('createdBy', 'name email');
};

module.exports = {
  calculateDistance,
  isPointInCircle,
  isPointInPolygon,
  checkUserLocation,
  getUserGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getAllGeofences,
};
