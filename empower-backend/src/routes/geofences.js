const express = require('express');
const auth = require('../middlewares/auth');
const {
  checkUserLocation,
  getUserGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getAllGeofences,
} = require('../services/geofenceService');
const Geofence = require('../models/Geofence');

// Create separate routers for admin and user routes
const adminRouter = express.Router();
const userRouter = express.Router();

const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) =>
  res.status(status).json({ success: false, error });

// Middleware to check if user is admin (basic check - you can enhance this)
const isAdmin = (req, res, next) => {
  // For now, assume any authenticated user can be admin
  // In production, check user role from database
  if (req.user) {
    return next();
  }
  return sendError(res, 'Admin access required', 403);
};

// ============= ADMIN ROUTES =============

/**
 * GET /api/admin/geofences
 * Get all geofences (admin only)
 */
adminRouter.get('/', auth, isAdmin, async (req, res) => {
  try {
    const geofences = await getAllGeofences();
    return sendSuccess(res, geofences);
  } catch (error) {
    console.error('Get geofences error:', error);
    return sendError(res, 'Failed to fetch geofences', 500);
  }
});

/**
 * POST /api/admin/geofences
 * Create a new geofence (admin only)
 */
adminRouter.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, description, type, center, radius, polygon, shape, color, enableNotifications, notifyOnEntry, notifyOnExit, isPublic, applicableUsers } = req.body;

    // Validation
    if (!name || !center || !center.lat || !center.lng) {
      return sendError(res, 'Name and center coordinates are required', 400);
    }

    if (shape === 'circle' && !radius) {
      return sendError(res, 'Radius is required for circle geofences', 400);
    }

    if (shape === 'polygon' && (!polygon || polygon.length < 3)) {
      return sendError(res, 'At least 3 points required for polygon geofences', 400);
    }

    const geofenceData = {
      name,
      description,
      type,
      center,
      radius,
      polygon,
      shape,
      color: color || (type === 'safe' ? '#4CAF50' : type === 'danger' ? '#FF5252' : '#2196F3'),
      enableNotifications,
      notifyOnEntry,
      notifyOnExit,
      isPublic: isPublic !== false,
      applicableUsers: applicableUsers || [],
    };

    const geofence = await createGeofence(geofenceData, req.user.id);
    return sendSuccess(res, geofence, 201);
  } catch (error) {
    console.error('Create geofence error:', error);
    return sendError(res, error.message || 'Failed to create geofence', 500);
  }
});

/**
 * PUT /api/admin/geofences/:id
 * Update a geofence (admin only)
 */
adminRouter.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating createdBy
    delete updateData.createdBy;

    const geofence = await updateGeofence(id, updateData);
    if (!geofence) {
      return sendError(res, 'Geofence not found', 404);
    }

    return sendSuccess(res, geofence);
  } catch (error) {
    console.error('Update geofence error:', error);
    return sendError(res, 'Failed to update geofence', 500);
  }
});

/**
 * DELETE /api/admin/geofences/:id
 * Delete a geofence (admin only)
 */
adminRouter.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const geofence = await deleteGeofence(id);

    if (!geofence) {
      return sendError(res, 'Geofence not found', 404);
    }

    return sendSuccess(res, { message: 'Geofence deleted successfully' });
  } catch (error) {
    console.error('Delete geofence error:', error);
    return sendError(res, 'Failed to delete geofence', 500);
  }
});

/**
 * PATCH /api/admin/geofences/:id/toggle
 * Toggle geofence active status (admin only)
 */
adminRouter.patch('/:id/toggle', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const geofence = await Geofence.findById(id);

    if (!geofence) {
      return sendError(res, 'Geofence not found', 404);
    }

    geofence.isActive = !geofence.isActive;
    await geofence.save();

    return sendSuccess(res, geofence);
  } catch (error) {
    console.error('Toggle geofence error:', error);
    return sendError(res, 'Failed to toggle geofence', 500);
  }
});

// ============= USER ROUTES =============

/**
 * GET /api/geofences
 * Get geofences applicable to the user
 */
userRouter.get('/', auth, async (req, res) => {
  try {
    const geofences = await getUserGeofences(req.user.id);
    return sendSuccess(res, geofences);
  } catch (error) {
    console.error('Get user geofences error:', error);
    return sendError(res, 'Failed to fetch geofences', 500);
  }
});

/**
 * POST /api/geofences/check
 * Check if user's location is inside any geofence
 */
userRouter.post('/check', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const results = await checkUserLocation(req.user.id, lat, lng);
    return sendSuccess(res, results);
  } catch (error) {
    console.error('Check location error:', error);
    return sendError(res, 'Failed to check location', 500);
  }
});

// Export both routers
module.exports = { adminRouter, userRouter };
