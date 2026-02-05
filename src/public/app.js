/**
 * EMPOWER SAFE - Shared JavaScript
 * Production-level utility functions for API calls, auth, and DOM manipulation
 */

class API {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = this.getToken();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
    this.token = token;
  }

  clearToken() {
    localStorage.removeItem('token');
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email, phone, password, name, emergencyContacts = []) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, phone, password, name, emergencyContacts }),
    });
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    this.clearToken();
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async updateProfile(userData) {
    return this.request('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async addContact(name, relation, phone) {
    return this.request('/api/users/contacts', {
      method: 'POST',
      body: JSON.stringify({ name, relation, phone }),
    });
  }

  async getContacts() {
    return this.request('/api/users/contacts');
  }

  async deleteContact(contactId) {
    return this.request(`/api/users/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Emergency endpoints
  async createSOS(message, location) {
    return this.request('/api/incident/create', {
      method: 'POST',
      body: JSON.stringify({ message, location }),
    });
  }

  async getIncidents() {
    return this.request('/api/incident/history');
  }

  async getIncident(id) {
    return this.request(`/api/incident/${id}`);
  }

  // NFC endpoints
  async registerNFC(deviceId) {
    return this.request('/api/nfc/register', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
  }

  // Check-in endpoints
  async scheduleCheckIn(scheduledTime, notes) {
    return this.request('/api/checkin/schedule', {
      method: 'POST',
      body: JSON.stringify({ scheduledTime, notes }),
    });
  }

  async completeCheckIn(checkInId, location) {
    return this.request(`/api/checkin/${checkInId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async getCheckIns() {
    return this.request('/api/checkin/list');
  }

  async deleteCheckIn(checkInId) {
    return this.request(`/api/checkin/${checkInId}`, {
      method: 'DELETE',
    });
  }

  // Community safety endpoints
  async submitSafetyReport(reportData) {
    return this.request('/api/community/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getNearbySafetyReports(lat, lng, radius) {
    return this.request('/api/community/nearby', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, radius }),
    });
  }

  async getSafetyHeatmap(bounds) {
    return this.request('/api/community/heatmap', {
      method: 'POST',
      body: JSON.stringify({ bounds }),
    });
  }

  // Safe zones
  async addSafeZone(zoneData) {
    return this.request('/api/users/safezones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  }

  async deleteSafeZone(zoneId) {
    return this.request(`/api/users/safezones/${zoneId}`, {
      method: 'DELETE',
    });
  }

  // Stats
  async getUserStats() {
    return this.request('/api/users/stats');
  }

  // Live location tracking
  async updateIncidentLocation(incidentId, lat, lng, address) {
    return this.request(`/api/incident/${incidentId}/location`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng, address }),
    });
  }

  // Contact acknowledgment
  async acknowledgeIncident(incidentId, contactData) {
    return this.request(`/api/incident/${incidentId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

// Global API instance
const api = new API();

/**
 * DOM Utilities
 */
class DOM {
  static get(selector) {
    return document.querySelector(selector);
  }

  static getAll(selector) {
    return document.querySelectorAll(selector);
  }

  static createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
  }

  static show(element) {
    if (element) element.classList.remove('hidden');
  }

  static hide(element) {
    if (element) element.classList.add('hidden');
  }

  static addClass(element, className) {
    if (element) element.classList.add(className);
  }

  static removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  static toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  }

  static setAttr(element, key, value) {
    if (element) element.setAttribute(key, value);
  }

  static getAttr(element, key) {
    if (element) return element.getAttribute(key);
    return null;
  }

  static removeAttr(element, key) {
    if (element) element.removeAttribute(key);
  }

  static on(element, event, handler) {
    if (element) element.addEventListener(event, handler);
  }

  static off(element, event, handler) {
    if (element) element.removeEventListener(event, handler);
  }

  static setText(element, text) {
    if (element) element.textContent = text;
  }

  static setHTML(element, html) {
    if (element) element.innerHTML = html;
  }
}

/**
 * UI Helper Functions
 */
class UI {
  static showLoading(element) {
    element.innerHTML = '<div class="spinner"></div>';
  }

  static showError(message, container) {
    const alert = DOM.createElement(
      'div',
      'alert alert-danger',
      `<strong>Error:</strong> ${message}`
    );
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
  }

  static showSuccess(message, container) {
    const alert = DOM.createElement(
      'div',
      'alert alert-success',
      `<strong>Success:</strong> ${message}`
    );
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
  }

  static showInfo(message, container) {
    const alert = DOM.createElement(
      'div',
      'alert alert-info',
      `<strong>Info:</strong> ${message}`
    );
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
  }

  static openModal(modalId) {
    const modal = DOM.get(`#${modalId}`);
    if (modal) DOM.addClass(modal, 'active');
  }

  static closeModal(modalId) {
    const modal = DOM.get(`#${modalId}`);
    if (modal) DOM.removeClass(modal, 'active');
  }

  static showConfirm(message) {
    return confirm(message);
  }

  static async showPrompt(message) {
    return prompt(message);
  }
}

/**
 * Auth Helper
 */
class Auth {
  static isAuthenticated() {
    return !!api.getToken();
  }

  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static logout() {
    api.clearToken();
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }

  static redirectToLogin() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
    }
  }

  static redirectToDashboard() {
    if (this.isAuthenticated()) {
      window.location.href = '/dashboard.html';
    }
  }
}

/**
 * Geolocation Helper
 */
class Location {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}

/**
 * Navbar Functionality
 */
class Navbar {
  constructor() {
    this.toggle = DOM.get('.navbar-toggle');
    this.menu = DOM.get('.navbar-menu');
    this.navbar = DOM.get('.navbar');
    this.init();
  }

  init() {
    // Toggle menu on mobile
    if (this.toggle) {
      DOM.on(this.toggle, 'click', () => this.toggleMenu());
    }

    // Close menu on link click
    const links = DOM.getAll('.navbar-menu a');
    links.forEach((link) => {
      DOM.on(link, 'click', () => this.closeMenu());
    });

    // Navbar scroll effect
    DOM.on(window, 'scroll', () => this.handleScroll());
  }

  toggleMenu() {
    DOM.toggleClass(this.menu, 'active');
  }

  closeMenu() {
    DOM.removeClass(this.menu, 'active');
  }

  handleScroll() {
    if (window.scrollY > 50) {
      DOM.addClass(this.navbar, 'scrolled');
    } else {
      DOM.removeClass(this.navbar, 'scrolled');
    }
  }
}

/**
 * Form Validation
 */
class Validator {
  static email(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static phone(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  static password(password) {
    return password.length >= 8;
  }

  static required(value) {
    return value && value.trim().length > 0;
  }

  static showError(element, message) {
    const error = DOM.createElement('div', 'form-error', message);
    if (element.nextElementSibling?.classList.contains('form-error')) {
      element.nextElementSibling.remove();
    }
    element.parentElement.appendChild(error);
    DOM.addClass(element, 'error');
  }

  static clearError(element) {
    if (element.nextElementSibling?.classList.contains('form-error')) {
      element.nextElementSibling.remove();
    }
    DOM.removeClass(element, 'error');
  }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  new Navbar();
  
  // Apply dark mode if enabled
  const user = Auth.getUser();
  if (user && user.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

/**
 * Shake Detection for SOS
 */
class ShakeDetector {
  constructor(callback, sensitivity = 15) {
    this.callback = callback;
    this.sensitivity = sensitivity;
    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;
    this.shakeCount = 0;
    this.shakeTimeout = null;
    this.enabled = false;
  }

  start() {
    this.enabled = true;
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.attachListener();
          }
        });
    } else {
      this.attachListener();
    }
  }

  attachListener() {
    window.addEventListener('devicemotion', (e) => this.handleMotion(e), false);
  }

  handleMotion(event) {
    if (!this.enabled) return;

    const acceleration = event.accelerationIncludingGravity;
    const x = acceleration.x;
    const y = acceleration.y;
    const z = acceleration.z;

    const deltaX = Math.abs(x - this.lastX);
    const deltaY = Math.abs(y - this.lastY);
    const deltaZ = Math.abs(z - this.lastZ);

    if (deltaX + deltaY + deltaZ > this.sensitivity) {
      this.shakeCount++;
      
      clearTimeout(this.shakeTimeout);
      this.shakeTimeout = setTimeout(() => {
        this.shakeCount = 0;
      }, 1000);

      if (this.shakeCount >= 3) {
        this.shakeCount = 0;
        this.callback();
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  }

  stop() {
    this.enabled = false;
  }
}

/**
 * Voice Activation Detection
 */
class VoiceDetector {
  constructor(callback, keywords = ['help empower', 'emergency']) {
    this.callback = callback;
    this.keywords = keywords;
    this.recognition = null;
    this.enabled = false;
  }

  start() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      for (const keyword of this.keywords) {
        if (transcript.includes(keyword.toLowerCase())) {
          this.callback();
          break;
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.enabled) {
        this.recognition.start(); // Restart if still enabled
      }
    };

    this.enabled = true;
    this.recognition.start();
  }

  stop() {
    this.enabled = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

/**
 * Battery Monitor
 */
class BatteryMonitor {
  constructor(threshold = 15, callback) {
    this.threshold = threshold;
    this.callback = callback;
    this.alerted = false;
  }

  async start() {
    if (!('getBattery' in navigator)) {
      console.warn('Battery API not supported');
      return;
    }

    try {
      const battery = await navigator.getBattery();
      
      const checkBattery = () => {
        const level = battery.level * 100;
        if (level <= this.threshold && !this.alerted) {
          this.alerted = true;
          this.callback(level);
        } else if (level > this.threshold) {
          this.alerted = false;
        }
      };

      battery.addEventListener('levelchange', checkBattery);
      checkBattery(); // Initial check
    } catch (error) {
      console.warn('Battery monitoring failed:', error);
    }
  }
}

/**
 * Fake Call Generator
 */
class FakeCall {
  static trigger(callerName = 'Mom', duration = 30000) {
    // Create full-screen fake call UI
    const callUI = document.createElement('div');
    callUI.id = 'fakeCall';
    callUI.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    callUI.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 20px;">Incoming Call</div>
        <div style="width: 120px; height: 120px; border-radius: 50%; background: #4CAF50; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
          📞
        </div>
        <div style="font-size: 2rem; font-weight: 600; margin-bottom: 10px;">${callerName}</div>
        <div style="font-size: 1.2rem; opacity: 0.7;">Mobile</div>
      </div>
      <div style="position: absolute; bottom: 80px; display: flex; gap: 60px;">
        <button onclick="document.getElementById('fakeCall').remove()" style="width: 70px; height: 70px; border-radius: 50%; background: #f44336; border: none; font-size: 1.8rem; cursor: pointer;">
          📵
        </button>
        <button onclick="FakeCall.answer()" style="width: 70px; height: 70px; border-radius: 50%; background: #4CAF50; border: none; font-size: 1.8rem; cursor: pointer;">
          📞
        </button>
      </div>
    `;

    document.body.appendChild(callUI);

    // Play ringtone
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuByvPJbysE');
    audio.loop = true;
    audio.play().catch(() => {});

    setTimeout(() => {
      if (document.getElementById('fakeCall')) {
        document.getElementById('fakeCall').remove();
        audio.pause();
      }
    }, duration);
  }

  static answer() {
    const callUI = document.getElementById('fakeCall');
    if (callUI) {
      callUI.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; margin-bottom: 20px;">Call in Progress</div>
          <div style="font-size: 3rem; margin-bottom: 30px;">⏱️</div>
          <div id="callTimer" style="font-size: 2rem; font-weight: 600;">00:00</div>
          <button onclick="document.getElementById('fakeCall').remove()" style="margin-top: 100px; width: 70px; height: 70px; border-radius: 50%; background: #f44336; border: none; font-size: 1.8rem; cursor: pointer;">
            📵
          </button>
        </div>
      `;

      let seconds = 0;
      const timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('callTimer');
        if (timerEl) {
          timerEl.textContent = `${mins}:${secs}`;
        } else {
          clearInterval(timer);
        }
      }, 1000);
    }
  }
}

/**
 * Polyfills & Utilities
 */
const debounce = (fn, delay = 300) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
};

const throttle = (fn, limit = 1000) => {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn.apply(this, args);
      lastRun = now;
    }
  };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    API, DOM, UI, Auth, Location, Navbar, Validator, 
    ShakeDetector, VoiceDetector, BatteryMonitor, FakeCall,
    debounce, throttle, delay 
  };
}
