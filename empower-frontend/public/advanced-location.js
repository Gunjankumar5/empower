/**
 * Real-Time Location Streamer
 * Continuously tracks and updates user location during active SOS alerts
 */
class LocationStreamer {
  constructor(userId, alertId, updateInterval = 5000) {
    this.userId = userId;
    this.alertId = alertId;
    this.updateInterval = updateInterval;
    this.isStreaming = false;
    this.watchId = null;
    this.lastLocation = null;
    this.updateCallback = null;
  }

  /**
   * Start streaming location updates
   * @param {Function} callback - Called when location is updated
   */
  async start(callback) {
    if (this.isStreaming) {
      console.warn('Location streaming already running');
      return;
    }

    this.updateCallback = callback;
    this.isStreaming = true;

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      this.isStreaming = false;
      return;
    }

    // Use watchPosition for continuous updates
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        this.lastLocation = location;

        // Send to server periodically (every updateInterval ms)
        if (callback) {
          callback(location);
        }

        // Update alert location on backend
        await this.sendLocationUpdate(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (callback) {
          callback(null);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    console.log('📍 Location streaming started');
  }

  /**
   * Send location update to backend
   */
  async sendLocationUpdate(location) {
    try {
      const token = localStorage.getItem('token');
      if (!token || !this.alertId) return;

      await fetch(`${API_BASE}/alerts/${this.alertId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(location)
      });
    } catch (error) {
      console.warn('Failed to update location:', error);
    }
  }

  /**
   * Stop streaming location updates
   */
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isStreaming = false;
    console.log('📍 Location streaming stopped');
  }

  /**
   * Get current location without streaming
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error)
      );
    });
  }

  isActive() {
    return this.isStreaming;
  }

  getLastLocation() {
    return this.lastLocation;
  }
}

/**
 * Geofencing: Safe Zones Manager
 * Defines safe areas and alerts when user leaves them
 */
class SafeZoneManager {
  constructor(userId) {
    this.userId = userId;
    this.zones = [];
    this.watchId = null;
    this.isMonitoring = false;
    this.exitAlerts = {}; // Track which zones user has exited
  }

  /**
   * Add a safe zone (circle with lat, lng, radius)
   */
  async addZone(zoneName, lat, lng, radiusMeters) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/safe-zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: zoneName,
          location: { lat, lng },
          radius: radiusMeters
        })
      });

      if (!response.ok) throw new Error('Failed to add safe zone');
      const zone = await response.json();
      this.zones.push(zone);
      return zone;
    } catch (error) {
      console.error('Failed to add safe zone:', error);
      throw error;
    }
  }

  /**
   * Load existing safe zones
   */
  async loadZones() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/safe-zones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load zones');
      this.zones = await response.json();
      return this.zones;
    } catch (error) {
      console.error('Failed to load safe zones:', error);
      return [];
    }
  }

  /**
   * Delete a safe zone
   */
  async deleteZone(zoneId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/profile/safe-zones/${zoneId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete zone');
      this.zones = this.zones.filter(z => z.id !== zoneId);
    } catch (error) {
      console.error('Failed to delete zone:', error);
      throw error;
    }
  }

  /**
   * Haversine formula to calculate distance between two coordinates
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.asin(Math.sqrt(a));
  }

  /**
   * Check if point is inside any safe zone
   */
  isInSafeZone(lat, lng) {
    for (const zone of this.zones) {
      const distance = this.calculateDistance(
        lat, lng,
        zone.location.lat, zone.location.lng
      );
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Start monitoring geofences
   */
  startMonitoring(onExit, onEnter) {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const inZone = this.isInSafeZone(userLat, userLng);

        for (const zone of this.zones) {
          if (inZone && inZone.id === zone.id) {
            // User is in this zone
            if (this.exitAlerts[zone.id]) {
              // User re-entered zone
              if (onEnter) onEnter(zone);
              delete this.exitAlerts[zone.id];
            }
          } else {
            // User is NOT in this zone
            if (!this.exitAlerts[zone.id]) {
              // User just exited zone
              if (onExit) onExit(zone);
              this.exitAlerts[zone.id] = true;
            }
          }
        }
      },
      (error) => console.error('Geofencing error:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    console.log('📍 Geofencing started for', this.zones.length, 'zones');
  }

  /**
   * Stop monitoring geofences
   */
  stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    this.isMonitoring = false;
    console.log('📍 Geofencing stopped');
  }
}

/**
 * Offline Maps Cacher
 * Caches map tiles for offline use using Service Workers + IndexedDB
 */
class OfflineMapsCacher {
  constructor() {
    this.dbName = 'EmpowerSafeMapCache';
    this.storeName = 'tiles';
    this.tileSize = 256;
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.db = null;
  }

  /**
   * Initialize IndexedDB for caching
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Cache a map tile
   */
  async cacheTile(url, data, timestamp = Date.now()) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const tileData = {
        url,
        data,
        timestamp,
        size: data.length
      };

      const request = store.put(tileData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(tileData);
    });
  }

  /**
   * Retrieve cached tile
   */
  async getTile(url) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  }

  /**
   * Pre-cache map tiles for a bounding box
   */
  async preCacheTiles(bounds, zoom = 14) {
    console.log('📥 Pre-caching map tiles for offline use...');

    const { north, south, east, west } = bounds;
    const tileUrls = this.getTileUrls(north, south, east, west, zoom);

    let cached = 0;
    const total = tileUrls.length;

    for (const url of tileUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          await this.cacheTile(url, blob);
          cached++;

          // Log progress
          if (cached % 10 === 0) {
            console.log(`📥 Cached ${cached}/${total} tiles`);
          }
        }
      } catch (error) {
        console.warn('Failed to cache tile:', url, error);
      }
    }

    console.log(`✅ Offline map cache complete: ${cached}/${total} tiles`);
    return { cached, total };
  }

  /**
   * Generate tile URLs for a bounding box
   */
  getTileUrls(north, south, east, west, zoom) {
    const urls = [];
    const { tileX: minX, tileY: minY } = this.latLngToTile(north, west, zoom);
    const { tileX: maxX, tileY: maxY } = this.latLngToTile(south, east, zoom);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // OpenStreetMap URL pattern
        urls.push(
          `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
          `https://b.tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
          `https://c.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
        );
      }
    }

    return urls;
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  latLngToTile(lat, lng, zoom) {
    const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { tileX, tileY };
  }

  /**
   * Clear old cached tiles (keep most recent)
   */
  async clearOldTiles(keepCount = 1000) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days old

      const request = index.openCursor(range);
      let deleted = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
    });
  }

  /**
   * Get cache size in bytes
   */
  async getCacheSize() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const totalSize = request.result.reduce((sum, tile) => sum + (tile.size || 0), 0);
        resolve(totalSize);
      };
    });
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.LocationStreamer = LocationStreamer;
  window.SafeZoneManager = SafeZoneManager;
  window.OfflineMapsCacher = OfflineMapsCacher;
}
