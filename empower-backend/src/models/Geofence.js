const mongoose = require('mongoose');

const GeofenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['safe', 'danger', 'work', 'home', 'custom'], default: 'custom' },
    
    // Geofence center point
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    
    // Radius in meters
    radius: { type: Number, required: true, default: 500 },
    
    // Polygon coordinates (for polygon zones)
    polygon: [{
      lat: { type: Number },
      lng: { type: Number },
    }],
    
    // Shape type
    shape: { type: String, enum: ['circle', 'polygon'], default: 'circle' },
    
    // Color for map visualization
    color: { type: String, default: '#4CAF50' },
    
    // Apply to specific users or all users
    applicableUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true }, // If false, only specific users
    
    // Notifications
    enableNotifications: { type: Boolean, default: true },
    notifyOnEntry: { type: Boolean, default: true },
    notifyOnExit: { type: Boolean, default: false },
    
    // Status
    isActive: { type: Boolean, default: true },
    
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created it
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for geospatial queries
GeofenceSchema.index({ 'center.lat': 1, 'center.lng': 1 });

module.exports = mongoose.model('Geofence', GeofenceSchema);
