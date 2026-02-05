document.addEventListener('DOMContentLoaded', async () => {
  Auth.redirectToLogin();

  const alerts = DOM.get('#alerts');
  let userProfile = null;
  let shakeDetector = null;
  let voiceDetector = null;
  let batteryMonitor = null;

  // Load user profile
  try {
    const profileData = await api.getUserProfile();
    userProfile = profileData.user;
    
    // Set initial toggle states
    DOM.get('#shakeToggle').checked = userProfile.shakeToAlert || false;
    DOM.get('#stealthToggle').checked = userProfile.stealthMode || false;
    DOM.get('#voiceToggle').checked = userProfile.voiceActivation || false;
    DOM.get('#voiceCode').value = userProfile.voiceCode || 'help empower';

    // Initialize features if enabled
    if (userProfile.shakeToAlert) {
      initShakeDetection();
    }
    if (userProfile.voiceActivation) {
      initVoiceDetection();
    }

    // Load check-ins and safe zones
    loadCheckIns();
    loadSafeZones();
    
    // Initialize battery monitor
    batteryMonitor = new BatteryMonitor(userProfile.batteryAlertThreshold || 15, (level) => {
      UI.showError(`Battery low (${level.toFixed(0)}%)! Consider charging your device.`, alerts);
      // Could also send alert to contacts
    });
    batteryMonitor.start();

  } catch (error) {
    UI.showError('Failed to load profile', alerts);
  }

  // Shake Detection Toggle
  DOM.on(DOM.get('#shakeToggle'), 'change', async (e) => {
    const enabled = e.target.checked;
    
    try {
      await api.updateProfile({ shakeToAlert: enabled });
      
      if (enabled) {
        initShakeDetection();
        UI.showSuccess('Shake detection enabled! Shake phone 3 times to trigger SOS.', alerts);
      } else {
        if (shakeDetector) shakeDetector.stop();
        UI.showSuccess('Shake detection disabled', alerts);
      }
    } catch (error) {
      e.target.checked = !enabled;
      UI.showError('Failed to update setting', alerts);
    }
  });

  // Stealth Mode Toggle
  DOM.on(DOM.get('#stealthToggle'), 'change', async (e) => {
    const enabled = e.target.checked;
    
    try {
      await api.updateProfile({ stealthMode: enabled });
      UI.showSuccess(enabled ? 'Silent mode enabled' : 'Silent mode disabled', alerts);
    } catch (error) {
      e.target.checked = !enabled;
      UI.showError('Failed to update setting', alerts);
    }
  });

  // Voice Activation Toggle
  DOM.on(DOM.get('#voiceToggle'), 'change', async (e) => {
    const enabled = e.target.checked;
    
    try {
      await api.updateProfile({ voiceActivation: enabled });
      
      if (enabled) {
        initVoiceDetection();
        UI.showSuccess('Voice activation enabled! Say your code phrase to trigger SOS.', alerts);
      } else {
        if (voiceDetector) voiceDetector.stop();
        UI.showSuccess('Voice activation disabled', alerts);
      }
    } catch (error) {
      e.target.checked = !enabled;
      UI.showError('Failed to update setting', alerts);
    }
  });

  // Voice Code Update
  DOM.on(DOM.get('#voiceCode'), 'blur', async (e) => {
    const code = e.target.value.trim();
    if (code) {
      try {
        await api.updateProfile({ voiceCode: code });
        UI.showSuccess('Code phrase updated', alerts);
        if (voiceDetector) {
          voiceDetector.stop();
          voiceDetector.keywords = [code];
          voiceDetector.start();
        }
      } catch (error) {
        UI.showError('Failed to update code phrase', alerts);
      }
    }
  });

  // Fake Call
  DOM.on(DOM.get('#triggerFakeCall'), 'click', () => {
    const callerName = DOM.get('#fakeCallerName').value || 'Mom';
    FakeCall.trigger(callerName, 30000);
  });

  // Schedule Check-in
  DOM.on(DOM.get('#addCheckInBtn'), 'click', () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    DOM.get('#checkInTime').value = now.toISOString().slice(0, 16);
    UI.openModal('checkInModal');
  });

  DOM.on(DOM.get('#checkInForm'), 'submit', async (e) => {
    e.preventDefault();
    const time = DOM.get('#checkInTime').value;
    const notes = DOM.get('#checkInNotes').value;

    try {
      await api.scheduleCheckIn(time, notes);
      UI.showSuccess('Check-in scheduled!', DOM.get('#checkInAlerts'));
      await delay(1000);
      UI.closeModal('checkInModal');
      loadCheckIns();
      DOM.get('#checkInForm').reset();
    } catch (error) {
      UI.showError('Failed to schedule check-in', DOM.get('#checkInAlerts'));
    }
  });

  // Add Safe Zone
  DOM.on(DOM.get('#addSafeZoneBtn'), 'click', async () => {
    try {
      const location = await Location.getCurrentLocation();
      DOM.get('#safeZoneModal').dataset.lat = location.lat;
      DOM.get('#safeZoneModal').dataset.lng = location.lng;
      UI.openModal('safeZoneModal');
    } catch (error) {
      UI.showError('Please enable location services', alerts);
    }
  });

  DOM.on(DOM.get('#safeZoneForm'), 'submit', async (e) => {
    e.preventDefault();
    
    const modal = DOM.get('#safeZoneModal');
    const zoneData = {
      name: DOM.get('#zoneName').value,
      lat: parseFloat(modal.dataset.lat),
      lng: parseFloat(modal.dataset.lng),
      radius: parseInt(DOM.get('#zoneRadius').value),
      notifyOnExit: DOM.get('#notifyOnExit').checked,
      notifyOnEnter: DOM.get('#notifyOnEnter').checked,
    };

    try {
      await api.addSafeZone(zoneData);
      UI.showSuccess('Safe zone added!', DOM.get('#zoneAlerts'));
      await delay(1000);
      UI.closeModal('safeZoneModal');
      loadSafeZones();
      DOM.get('#safeZoneForm').reset();
    } catch (error) {
      UI.showError('Failed to add safe zone', DOM.get('#zoneAlerts'));
    }
  });

  // Report Safety Issue
  DOM.on(DOM.get('#reportIssueBtn'), 'click', async () => {
    try {
      const location = await Location.getCurrentLocation();
      showReportModal(location);
    } catch (error) {
      UI.showError('Please enable location services to report', alerts);
    }
  });

  // View Heatmap
  DOM.on(DOM.get('#viewHeatmapBtn'), 'click', async () => {
    try {
      const location = await Location.getCurrentLocation();
      const bounds = {
        north: location.lat + 0.05,
        south: location.lat - 0.05,
        east: location.lng + 0.05,
        west: location.lng - 0.05,
      };
      const response = await api.getSafetyHeatmap(bounds);
      showHeatmapModal(response);
    } catch (error) {
      UI.showError('Failed to load heatmap', alerts);
    }
  });

  // View Nearby Reports
  DOM.on(DOM.get('#viewReportsBtn'), 'click', async () => {
    try {
      const location = await Location.getCurrentLocation();
      const reports = await api.getNearbySafetyReports(location.lat, location.lng, 10000);
      showReportsModal(reports.reports || []);
    } catch (error) {
      UI.showError('Failed to load nearby reports', alerts);
    }
  });

  // Logout
  DOM.on(DOM.get('#logoutBtn'), 'click', () => {
    if (UI.showConfirm('Logout?')) Auth.logout();
  });

  // Helper Functions
  function initShakeDetection() {
    shakeDetector = new ShakeDetector(async () => {
      UI.showSuccess('Shake detected! Sending SOS...', alerts);
      await triggerSOS('shake');
    }, 15);
    shakeDetector.start();
  }

  function initVoiceDetection() {
    const code = userProfile?.voiceCode || 'help empower';
    voiceDetector = new VoiceDetector(async () => {
      UI.showSuccess('Voice command detected! Sending SOS...', alerts);
      await triggerSOS('voice');
    }, [code]);
    voiceDetector.start();
  }

  async function triggerSOS(alertType) {
    try {
      let location = null;
      try {
        location = await Location.getCurrentLocation();
      } catch (err) {
        console.warn('Location unavailable');
      }

      const battery = navigator.getBattery ? await navigator.getBattery() : null;
      const batteryLevel = battery ? battery.level * 100 : null;

      await api.createSOS(
        `Emergency SOS Alert (${alertType})`,
        location,
        alertType,
        'critical',
        batteryLevel,
        navigator.onLine ? 'online' : 'offline'
      );

      if (Notification.permission === 'granted' && !userProfile.stealthMode) {
        new Notification('🚨 SOS Alert Sent', {
          body: 'Emergency contacts notified',
          requireInteraction: true,
        });
      }

      UI.showSuccess('SOS alert sent successfully!', alerts);
    } catch (error) {
      UI.showError('Failed to send SOS: ' + error.message, alerts);
    }
  }

  async function loadCheckIns() {
    try {
      const data = await api.getCheckIns();
      const list = DOM.get('#checkInsList');
      
      if (!data.checkIns || data.checkIns.length === 0) {
        list.innerHTML = '<p class="text-muted text-center">No scheduled check-ins</p>';
        return;
      }

      list.innerHTML = data.checkIns.slice(0, 5).map(checkIn => {
        const time = new Date(checkIn.scheduledTime);
        const statusBadge = {
          pending: 'badge-warning',
          completed: 'badge-success',
          missed: 'badge-danger',
        }[checkIn.status] || 'badge-primary';

        return `
          <div class="card mt-md">
            <div class="flex-between">
              <div>
                <strong>${time.toLocaleString()}</strong>
                <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.875rem; color: var(--text-light);">
                  ${checkIn.notes || 'No notes'}
                </p>
              </div>
              <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                <span class="badge ${statusBadge}">${checkIn.status}</span>
                ${checkIn.status === 'pending' ? `
                  <button class="btn btn-sm btn-success" onclick="completeCheckIn('${checkIn._id}')">Done</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteCheckIn('${checkIn._id}')">×</button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Load check-ins error:', error);
    }
  }

  async function loadSafeZones() {
    const list = DOM.get('#safeZonesList');
    
    if (!userProfile || !userProfile.safeZones || userProfile.safeZones.length === 0) {
      list.innerHTML = '<p class="text-muted text-center">No safe zones configured</p>';
      return;
    }

    list.innerHTML = userProfile.safeZones.map(zone => `
      <div class="card mt-md">
        <div class="flex-between">
          <div>
            <strong>📍 ${zone.name}</strong>
            <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.875rem; color: var(--text-light);">
              Radius: ${zone.radius}m ${zone.notifyOnExit ? '• Exit alerts enabled' : ''}
            </p>
          </div>
          <button class="btn btn-sm btn-danger" onclick="deleteSafeZone('${zone.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // Global functions for onclick handlers
  window.completeCheckIn = async (id) => {
    try {
      const location = await Location.getCurrentLocation().catch(() => null);
      await api.completeCheckIn(id, location);
      UI.showSuccess('Check-in completed!', alerts);
      loadCheckIns();
    } catch (error) {
      UI.showError('Failed to complete check-in', alerts);
    }
  };

  window.deleteCheckIn = async (id) => {
    if (!UI.showConfirm('Delete this check-in?')) return;
    try {
      await api.deleteCheckIn(id);
      UI.showSuccess('Check-in deleted', alerts);
      loadCheckIns();
    } catch (error) {
      UI.showError('Failed to delete check-in', alerts);
    }
  };

  window.deleteSafeZone = async (id) => {
    if (!UI.showConfirm('Delete this safe zone?')) return;
    try {
      await api.deleteSafeZone(id);
      UI.showSuccess('Safe zone deleted', alerts);
      // Reload profile
      const profileData = await api.getUserProfile();
      userProfile = profileData.user;
      loadSafeZones();
    } catch (error) {
      UI.showError('Failed to delete safe zone', alerts);
    }
  };

  // Modal Functions
  function showReportModal(location) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Report Safety Issue</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <form id="reportForm">
          <div class="form-group">
            <label>Issue Type</label>
            <select id="reportType" required>
              <option value="">Select type...</option>
              <option value="harassment">Harassment</option>
              <option value="unsafe">Unsafe Location</option>
              <option value="poor_lighting">Poor Lighting</option>
              <option value="suspicious">Suspicious Activity</option>
              <option value="positive">Positive (Safe Place)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Severity</label>
            <select id="reportSeverity" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea id="reportDesc" rows="3" placeholder="Details about this location..."></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="reportAnonymous" checked> Report anonymously
            </label>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Report</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#reportForm');
    DOM.on(form, 'submit', async (e) => {
      e.preventDefault();
      try {
        await api.submitSafetyReport({
          location: { lat: location.lat, lng: location.lng },
          reportType: DOM.get('#reportType').value,
          severity: DOM.get('#reportSeverity').value,
          description: DOM.get('#reportDesc').value,
          anonymous: DOM.get('#reportAnonymous').checked,
        });
        UI.showSuccess('Report submitted! Thank you for helping others.', alerts);
        modal.remove();
      } catch (error) {
        UI.showError('Failed to submit report', alerts);
      }
    });
  }

  function showHeatmapModal(response) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    const heatmapData = response.heatmap || [];
    const reportCount = heatmapData.reduce((sum, item) => sum + (item.count || 0), 0);
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3>🗺️ Safety Heatmap</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div style="padding: var(--spacing-md) 0;">
          <p style="margin-bottom: var(--spacing-md); color: var(--text-light);">
            ${reportCount > 0 
              ? `<strong>${reportCount}</strong> reports in your area`
              : 'No reports in this area. Stay safe!'}
          </p>
          <div id="heatmapStats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md);">
            <div style="text-align: center;">
              <strong style="font-size: 1.5rem;">⚠️</strong>
              <p style="margin: var(--spacing-xs) 0 0 0;">High Risk Areas</p>
            </div>
            <div style="text-align: center;">
              <strong style="font-size: 1.5rem;">✅</strong>
              <p style="margin: var(--spacing-xs) 0 0 0;">Safe Places</p>
            </div>
          </div>
          <div id="reportsList" style="margin-top: var(--spacing-lg); max-height: 300px; overflow-y: auto;">
            ${heatmapData.length > 0
              ? heatmapData.slice(0, 5).map(item => `
                  <div class="card mt-md">
                    <strong>📍 Lat: ${item._id.lat.toFixed(3)}, Lng: ${item._id.lng.toFixed(3)}</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.875rem;">
                      <strong>${item.count}</strong> reports • Severity: <strong>${(item.avgSeverity || 2).toFixed(1)}/4</strong>
                    </p>
                  </div>
                `).join('')
              : '<p class="text-muted text-center">No reports in this area</p>'}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function showReportsModal(reports) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3>📍 Nearby Reports</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div style="padding: var(--spacing-md) 0; max-height: 400px; overflow-y: auto;">
          ${reports && reports.length > 0
            ? reports.map(r => `
                <div class="card mt-md">
                  <div class="flex-between">
                    <div>
                      <strong>${r.reportType.toUpperCase()}</strong>
                      <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.875rem;">
                        ${r.description || 'No description'}
                      </p>
                      <small style="color: var(--text-light);">
                        Severity: <strong>${r.severity}</strong>
                      </small>
                    </div>
                    <div style="text-align: right;">
                      <div class="badge ${
                        r.severity === 'critical' ? 'badge-danger' :
                        r.severity === 'high' ? 'badge-warning' :
                        'badge-success'
                      }">${r.severity}</div>
                      <p style="margin: var(--spacing-sm) 0 0 0; font-size: 0.75rem;">
                        👍 ${r.upvotes || 0}
                      </p>
                    </div>
                  </div>
                </div>
              `).join('')
            : '<p class="text-muted text-center" style="padding: var(--spacing-lg);">No nearby reports</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
});
