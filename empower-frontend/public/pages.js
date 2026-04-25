const page = document.body?.dataset?.page || '';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
}

function setLoadingState(button, loading, options = {}) {
  if (!button) {
    return;
  }

  const text = options.textEl ? $(options.textEl) : null;
  const spinner = options.spinnerEl ? $(options.spinnerEl) : null;

  button.disabled = loading;
  if (text && options.defaultText) {
    text.textContent = loading ? (options.loadingText || options.defaultText) : options.defaultText;
  }

  if (spinner) {
    spinner.classList.toggle('hidden', !loading);
  }
}

function showInlineError(container, message) {
  if (!container) {
    showToast(message, 'error');
    return;
  }

  container.innerHTML = `<div class="alert alert-danger">${escapeHtml(message)}</div>`;
}

function clearInlineError(container) {
  if (container) {
    container.innerHTML = '';
  }
}

function storeSession(data) {
  if (data?.token) {
    saveToken(data.token);
  }

  if (data?.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

function logout() {
  clearToken();
  window.location.href = '/login.html';
}

async function initLoginPage() {
  if (getToken()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = $('#loginForm');
  const email = $('#email');
  const password = $('#password');
  const errorBox = $('#authError');
  const submitBtn = $('#loginBtn');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInlineError(errorBox);

    try {
      setLoadingState(submitBtn, true, { textEl: '#loginText', spinnerEl: '#loginSpinner', defaultText: 'Sign In', loadingText: 'Signing In' });
      const data = await apiCall('/auth/login', 'POST', { email: email.value.trim(), password: password.value });
      storeSession(data);
      showToast('Login successful', 'success');
      window.location.href = '/dashboard.html';
    } catch (error) {
      showInlineError(errorBox, error.message || 'Login failed');
    } finally {
      setLoadingState(submitBtn, false, { textEl: '#loginText', spinnerEl: '#loginSpinner', defaultText: 'Sign In' });
    }
  });
}

async function initRegisterPage() {
  if (getToken()) {
    window.location.href = '/dashboard.html';
    return;
  }

  // Step 1 elements
  const accountForm = $('#accountForm');
  const step1NextBtn = $('#step1NextBtn');
  const step1Error = $('#step1Error');
  const nameInput = $('#name');
  const emailInput = $('#email');
  const phoneInput = $('#phone');
  const passwordInput = $('#password');
  const confirmPasswordInput = $('#confirmPassword');

  // Step 2 elements
  const step1Content = $('#step1Content');
  const step2Content = $('#step2Content');
  const step2BackBtn = $('#step2BackBtn');
  const contactsForm = $('#contactsForm');
  const contactsList = $('#contactsList');
  const addContactBtn = $('#addContactBtn');
  const step2Error = $('#step2Error');
  const registerBtn = $('#registerBtn');

  // Progress elements
  const progressSteps = $$('.progress-step');

  let contacts = [];
  let accountData = {};

  const updateProgressBar = (step) => {
    progressSteps.forEach((el) => {
      if (parseInt(el.dataset.step) <= step) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  };

  const renderContacts = () => {
    if (contacts.length === 0) {
      contactsList.innerHTML = '<p class="text-muted" style="text-align: center; padding: 16px;">No contacts added yet. Add at least one emergency contact.</p>';
      return;
    }

    contactsList.innerHTML = contacts
      .map(
        (contact, index) => `
        <div class="contact-card" style="padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(contact.name)}</div>
              <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 4px;">${escapeHtml(contact.phone)}</div>
              <div style="font-size: 0.85rem; color: var(--text-light);">${escapeHtml(contact.relation || 'Contact')}</div>
            </div>
            <button type="button" class="btn btn-danger btn-sm" data-remove-index="${index}" style="white-space: nowrap;">Remove</button>
          </div>
        </div>
      `
      )
      .join('');
  };

  const addContact = (name, phone, relation) => {
    contacts.push({ name, phone, relation });
    renderContacts();
    clearInlineError(step2Error);
  };

  const removeContact = (index) => {
    contacts.splice(index, 1);
    renderContacts();
  };

  // Step 1: Validate and move to step 2
  step1NextBtn.addEventListener('click', async () => {
    clearInlineError(step1Error);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validation
    if (!name) {
      showInlineError(step1Error, 'Please enter your full name');
      return;
    }

    if (!email || !email.includes('@')) {
      showInlineError(step1Error, 'Please enter a valid email address');
      return;
    }

    if (!phone || phone.length < 10) {
      showInlineError(step1Error, 'Please enter a valid phone number');
      return;
    }

    if (password.length < 8) {
      showInlineError(step1Error, 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      showInlineError(step1Error, 'Passwords do not match');
      return;
    }

    // Store account data and move to step 2
    accountData = { name, email, phone, password };
    contacts = [];
    renderContacts();

    step1Content.style.display = 'none';
    step2Content.style.display = 'block';
    updateProgressBar(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Step 2: Back button
  step2BackBtn.addEventListener('click', () => {
    step2Content.style.display = 'none';
    step1Content.style.display = 'block';
    updateProgressBar(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Add contact button
  addContactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 420px;">
        <div class="modal-header">
          <h3>Add Emergency Contact</h3>
          <button type="button" class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
        </div>
        <form id="addContactForm" style="display: grid; gap: 16px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="contactName">Name</label>
            <input id="contactName" type="text" placeholder="e.g., Mom" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label for="contactPhone">Phone Number</label>
            <input id="contactPhone" type="tel" placeholder="+1 (555) 000-0000" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label for="contactRelation">Relation</label>
            <input id="contactRelation" type="text" placeholder="e.g., Mother, Friend" required>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">Add Contact</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const form = $('#addContactForm', modal);
    const closeBtn = $('.modal-close', modal);
    const cancelBtn = $('button[type="button"]', modal);

    const close = () => modal.remove();

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#contactName', modal).value.trim();
      const phone = $('#contactPhone', modal).value.trim();
      const relation = $('#contactRelation', modal).value.trim();

      if (!name || !phone || !relation) {
        return showToast('Please fill in all fields', 'error');
      }

      addContact(name, phone, relation);
      close();
    });
  });

  // Remove contact handler (event delegation)
  contactsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-index]');
    if (removeBtn) {
      const index = parseInt(removeBtn.dataset.removeIndex);
      removeContact(index);
    }
  });

  // Submit registration
  contactsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInlineError(step2Error);

    if (contacts.length === 0) {
      showInlineError(step2Error, 'Please add at least one emergency contact');
      return;
    }

    try {
      setLoadingState(registerBtn, true, { textEl: '#registerText', spinnerEl: '#registerSpinner', defaultText: 'Create Account', loadingText: 'Creating' });
      const data = await apiCall('/auth/register', 'POST', {
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        password: accountData.password,
        emergencyContacts: contacts,
      });
      storeSession(data);
      showToast('Account created successfully!', 'success');
      window.location.href = '/dashboard.html';
    } catch (error) {
      showInlineError(step2Error, error.message || 'Registration failed');
    } finally {
      setLoadingState(registerBtn, false, { textEl: '#registerText', spinnerEl: '#registerSpinner', defaultText: 'Create Account' });
    }
  });

  updateProgressBar(1);
}

async function initDashboardPage() {
  if (!checkAuth()) {
    return;
  }

  const welcomeName = $('#welcomeName');
  const alertsCount = $('#alertsCount');
  const contactsCount = $('#contactsCount');
  const logoutBtn = $('#logoutBtn');
  const sosBtn = $('#sosBtn');
  const sosText = $('#sosBtnText');
  const sosSpinner = $('#sosBtnSpinner');
  const dashboardStatus = $('#dashboardStatus');
  const profileName = $('#profileName');

  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.id = 'sosCountdownModal';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 420px; text-align: center;">
      <h3 style="margin-bottom: 8px;">SOS will send in <span id="sosCountdownValue">3</span>s</h3>
      <p style="margin-bottom: 20px;">You can cancel before the alert is sent.</p>
      <div class="modal-footer" style="justify-content: center;">
        <button type="button" class="btn btn-secondary" id="sosCancelBtn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const countdownValue = $('#sosCountdownValue', overlay);
  const cancelBtn = $('#sosCancelBtn', overlay);
  let countdownTimer = null;
  let countdown = 3;

  const loadDashboard = async () => {
    const [profile, alerts] = await Promise.all([
      apiCall('/profile'),
      apiCall('/alerts/history'),
    ]);

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';
    const name = profile?.name || 'there';
    if (welcomeName) {
      welcomeName.textContent = `${greeting}, ${name}`;
    }
    if (profileName) {
      profileName.textContent = name;
    }
    if (contactsCount) {
      contactsCount.textContent = String(profile?.emergencyContacts?.length || 0);
    }
    if (alertsCount) {
      alertsCount.textContent = String(alerts.length || 0);
    }
    if (dashboardStatus) {
      dashboardStatus.textContent = profile?.lastKnownLocation?.address ? 'Location ready' : 'Ready';
    }
  };

  const resetSosButton = () => {
    if (sosBtn) {
      sosBtn.disabled = false;
    }
    if (sosText) {
      sosText.textContent = 'SOS';
    }
    if (sosSpinner) {
      sosSpinner.classList.add('hidden');
    }
  };

  const sendSos = async () => {
    try {
      setLoadingState(sosBtn, true, { textEl: '#sosBtnText', spinnerEl: '#sosBtnSpinner', defaultText: 'SOS', loadingText: 'Sending' });
      
      let location = null;
      let locationSource = 'none';
      
      // Try to get current location first
      try {
        location = await Location.getCurrentLocation();
        locationSource = 'current';
        console.log('✅ Current location obtained:', location);
      } catch (error) {
        console.warn('⚠️ Current location failed:', error.message);
        
        // Fallback: Try to get last known location from profile
        try {
          const profile = await apiCall('/profile');
          if (profile?.lastKnownLocation?.lat && profile?.lastKnownLocation?.lng) {
            location = {
              lat: profile.lastKnownLocation.lat,
              lng: profile.lastKnownLocation.lng,
            };
            locationSource = 'lastKnown';
            console.log('✅ Using last known location:', location);
          } else {
            console.warn('⚠️ No lastKnownLocation in profile');
          }
        } catch (profileError) {
          console.warn('Could not get last known location:', profileError.message);
        }
      }

      // Send SOS with or without location
      const alertData = { type: 'sos' };
      if (location?.lat && location?.lng) {
        alertData.lat = location.lat;
        alertData.lng = location.lng;
      }

      console.log('📤 Sending alert with data:', alertData, 'Location source:', locationSource);
      const response = await apiCall('/alerts/trigger', 'POST', alertData);
      console.log('✅ Alert response:', response);

      // Start real-time location streaming if alert creation was successful
      if (response && response.id && window.advancedLocation) {
        try {
          await window.advancedLocation.startStreaming(response.id);
        } catch (streamError) {
          console.warn('Failed to start location streaming:', streamError);
        }
      }

      if (location?.lat && location?.lng) {
        showToast(`🚨 Emergency alert sent with location (${locationSource})! Notifying contacts...`, 'success');
      } else {
        showToast('🚨 Emergency alert sent! (No location available - Notifying contacts...)', 'warning');
      }
      
      await loadDashboard();
    } catch (error) {
      console.error('SOS Error:', error);
      showToast(error.message || 'Failed to send SOS', 'error');
    } finally {
      resetSosButton();
      overlay.classList.remove('active');
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  };

  const startCountdown = () => {
    if (countdownTimer) {
      return;
    }

    countdown = 3;
    if (countdownValue) {
      countdownValue.textContent = String(countdown);
    }
    overlay.classList.add('active');

    countdownTimer = setInterval(() => {
      countdown -= 1;
      if (countdownValue) {
        countdownValue.textContent = String(Math.max(countdown, 0));
      }

      if (countdown <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        sendSos();
      }
    }, 1000);
  };

  cancelBtn.addEventListener('click', () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    overlay.classList.remove('active');
    resetSosButton();
    showToast('SOS cancelled', 'info');
  });

  sosBtn.addEventListener('click', startCountdown);
  logoutBtn?.addEventListener('click', logout);

  await loadDashboard();
}

async function initContactsPage() {
  if (!checkAuth()) {
    return;
  }

  const contactsList = $('#contactsList');
  const addContactBtn = $('#addContactBtn');
  const modal = $('#contactModal');
  const modalTitle = $('#contactModalTitle');
  const form = $('#contactForm');
  const errorBox = $('#contactError');
  const submitBtn = $('#contactSubmitBtn');
  const closeBtn = $('#contactModalClose');
  const cancelBtn = $('#contactCancelBtn');
  const contactIdInput = $('#contactId');

  const nameInput = $('#contactName');
  const phoneInput = $('#contactPhone');
  const emailInput = $('#contactEmail');
  const relationInput = $('#contactRelation');

  let contacts = [];

  const openModal = (contact = null) => {
    clearInlineError(errorBox);
    if (contact) {
      modalTitle.textContent = 'Edit Contact';
      contactIdInput.value = contact.id;
      nameInput.value = contact.name || '';
      phoneInput.value = contact.phone || '';
      emailInput.value = contact.email || '';
      relationInput.value = contact.relation || '';
      
      // Show preview for existing contact
      const previewBox = $('#contactPhonePreview');
      const previewFormatted = $('#contactPhoneFormatted');
      if (contact.phone) {
        previewFormatted.textContent = contact.phone;
        previewBox.style.display = 'block';
        previewBox.style.borderColor = '#0066cc';
        previewBox.style.background = '#f0f8ff';
      }
    } else {
      modalTitle.textContent = 'Add Contact';
      contactIdInput.value = '';
      form.reset();
      const previewBox = $('#contactPhonePreview');
      previewBox.style.display = 'none';
    }
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    clearInlineError(errorBox);
  };

  const renderContacts = () => {
    if (!contacts.length) {
      contactsList.innerHTML = `
        <div class="card" style="text-align: center;">
          <p style="margin: 0;">No emergency contacts added yet.</p>
        </div>
      `;
      return;
    }

    contactsList.innerHTML = contacts
      .map(
        (contact) => `
        <article class="card contact-card" data-id="${escapeHtml(contact.id)}">
          <div class="flex-between" style="gap: 16px; align-items: flex-start;">
            <div>
              <h3 style="margin-bottom: 4px;">${escapeHtml(contact.name)}</h3>
              <p style="margin-bottom: 4px;">${escapeHtml(contact.phone)}</p>
              <p style="margin-bottom: 0; color: var(--text-light);">${escapeHtml(contact.relation || 'Contact')}</p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary btn-sm" data-action="edit">Edit</button>
              <button type="button" class="btn btn-danger btn-sm" data-action="delete">Delete</button>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  };

  const loadContacts = async () => {
    contacts = await apiCall('/contacts');
    renderContacts();
  };

  contactsList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const card = event.target.closest('[data-id]');
    const contactId = card?.dataset?.id;
    const contact = contacts.find((item) => item.id === contactId);

    if (!contact) {
      return;
    }

    if (button.dataset.action === 'edit') {
      openModal(contact);
      return;
    }

    if (button.dataset.action === 'delete') {
      if (!window.confirm(`Delete ${contact.name}?`)) {
        return;
      }

      await apiCall(`/contacts/${contactId}`, 'DELETE');
      showToast('Contact deleted', 'success');
      await loadContacts();
    }
  });

  addContactBtn?.addEventListener('click', () => openModal());
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Real-time phone preview
  phoneInput.addEventListener('input', (e) => {
    const phone = e.target.value.trim();
    const previewBox = $('#contactPhonePreview');
    const previewFormatted = $('#contactPhoneFormatted');

    if (phone) {
      const validation = API.validatePhoneNumber(phone);
      if (validation.valid) {
        previewFormatted.textContent = validation.formatted;
        previewBox.style.display = 'block';
        previewBox.style.borderColor = '#0066cc';
        previewBox.style.background = '#f0f8ff';
      } else {
        previewBox.style.display = 'block';
        previewBox.style.borderColor = '#cc0000';
        previewBox.style.background = '#ffe6e6';
        previewFormatted.textContent = '⚠ Invalid format';
      }
    } else {
      previewBox.style.display = 'none';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInlineError(errorBox);

    try {
      setLoadingState(submitBtn, true, { textEl: '#contactSubmitText', spinnerEl: '#contactSubmitSpinner', defaultText: 'Save Contact', loadingText: 'Saving' });
      
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const relation = relationInput.value.trim();

      // Validate and format phone number
      const phoneValidation = API.validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        showInlineError(errorBox, phoneValidation.error);
        setLoadingState(submitBtn, false, { textEl: '#contactSubmitText', spinnerEl: '#contactSubmitSpinner', defaultText: 'Save Contact' });
        return;
      }

      const payload = {
        name,
        phone: phoneValidation.formatted,
        email,
        relation,
      };

      const contactId = contactIdInput.value.trim();
      if (contactId) {
        await apiCall(`/contacts/${contactId}`, 'PUT', payload);
        showToast(`✓ Contact updated (saved as ${phoneValidation.formatted})`, 'success');
      } else {
        await apiCall('/contacts', 'POST', payload);
        showToast(`✓ Contact added (saved as ${phoneValidation.formatted})`, 'success');
      }

      closeModal();
      await loadContacts();
    } catch (error) {
      showInlineError(errorBox, error.message || 'Failed to save contact');
    } finally {
      setLoadingState(submitBtn, false, { textEl: '#contactSubmitText', spinnerEl: '#contactSubmitSpinner', defaultText: 'Save Contact' });
    }
  });

  await loadContacts();
}

async function initProfilePage() {
  if (!checkAuth()) {
    return;
  }

  const form = $('#profileForm');
  const nameInput = $('#profileNameInput');
  const emailInput = $('#profileEmailInput');
  const phoneInput = $('#profilePhoneInput');
  const pictureInput = $('#profilePicInput');
  const nfcTagField = $('#profileNfcTag');
  const errorBox = $('#profileError');
  const submitBtn = $('#profileSubmitBtn');
  const logoutBtn = $('#logoutBtn');

  const loadProfile = async () => {
    const profile = await apiCall('/profile');
    nameInput.value = profile.name || '';
    emailInput.value = profile.email || '';
    phoneInput.value = profile.phone || '';
    pictureInput.value = profile.profilePic || '';
    nfcTagField.textContent = profile.nfcTagId || 'Not registered';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInlineError(errorBox);

    try {
      setLoadingState(submitBtn, true, { textEl: '#profileSubmitText', spinnerEl: '#profileSubmitSpinner', defaultText: 'Save Changes', loadingText: 'Saving' });
      const data = await apiCall('/profile', 'PUT', {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        profilePic: pictureInput.value.trim(),
      });
      nfcTagField.textContent = data.nfcTagId || nfcTagField.textContent;
      showToast('Profile updated', 'success');
    } catch (error) {
      showInlineError(errorBox, error.message || 'Failed to update profile');
    } finally {
      setLoadingState(submitBtn, false, { textEl: '#profileSubmitText', spinnerEl: '#profileSubmitSpinner', defaultText: 'Save Changes' });
    }
  });

  logoutBtn?.addEventListener('click', logout);
  await loadProfile();
}

async function initFeaturesPage() {
  if (!checkAuth()) {
    return;
  }

  const currentTag = $('#currentTagId');
  const scanBtn = $('#scanNfcBtn');
  const manualTagInput = $('#manualTagId');
  const registerTagBtn = $('#registerTagBtn');
  const statusBox = $('#nfcStatus');
  const fallbackBox = $('#nfcFallback');
  const logoutBtn = $('#logoutBtn');

  const loadProfile = async () => {
    const profile = await apiCall('/profile');
    const nfcTagId = profile.nfcTagId || 'No NFC tag registered yet';
    currentTag.textContent = nfcTagId;
    if (manualTagInput && profile.nfcTagId) {
      manualTagInput.value = profile.nfcTagId;
    }
  };

  const registerTag = async (tagId) => {
    const trimmedTagId = String(tagId || '').trim();
    if (!trimmedTagId) {
      throw new Error('Tag ID is required');
    }

    const result = await apiCall('/profile/nfc', 'POST', { tagId: trimmedTagId });
    currentTag.textContent = result?.nfcTagId || trimmedTagId;
    if (manualTagInput) {
      manualTagInput.value = result?.nfcTagId || trimmedTagId;
    }
    statusBox.textContent = 'NFC tag registered successfully';
    showToast('NFC tag registered', 'success');
  };

  if (!('NDEFReader' in window)) {
    fallbackBox?.classList.remove('hidden');
  }

  scanBtn?.addEventListener('click', async () => {
    if (!('NDEFReader' in window)) {
      fallbackBox?.classList.remove('hidden');
      showToast('Web NFC is not supported on this browser', 'error');
      return;
    }

    const reader = new NDEFReader();
    let timeoutId = null;

    try {
      statusBox.textContent = 'Scan started. Tap your NFC tag to the phone.';

      const tagId = await new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error('NFC scan timed out')), 20000);

        reader.onreading = async (event) => {
          const resolvedTagId = event.serialNumber || event.message?.records?.[0]?.id || `nfc-${Date.now()}`;
          clearTimeout(timeoutId);
          resolve(resolvedTagId);
        };

        reader.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('NFC scan failed'));
        };

        reader.scan().catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      });

      await registerTag(tagId);
    } catch (error) {
      statusBox.textContent = error.message || 'Failed to scan NFC tag';
      showToast(error.message || 'Failed to scan NFC tag', 'error');
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  });

  registerTagBtn?.addEventListener('click', async () => {
    try {
      await registerTag(manualTagInput?.value);
    } catch (error) {
      statusBox.textContent = error.message || 'Failed to save tag ID';
      showToast(error.message || 'Failed to save tag ID', 'error');
    }
  });

  logoutBtn?.addEventListener('click', logout);
  await loadProfile();
}

async function initHistoryPage() {
  if (!checkAuth()) {
    return;
  }

  const tableBody = $('#historyTableBody');
  const emptyState = $('#historyEmptyState');
  const refreshBtn = $('#refreshHistoryBtn');
  const logoutBtn = $('#logoutBtn');
  let alertsCache = [];

  const renderHistory = (alerts) => {
    alertsCache = Array.isArray(alerts) ? alerts : [];

    if (!alertsCache.length) {
      emptyState?.classList.remove('hidden');
      tableBody.innerHTML = '';
      return;
    }

    emptyState?.classList.add('hidden');
    tableBody.innerHTML = alertsCache
      .map((alert) => {
        const badgeClass = alert.resolved ? 'badge-resolved' : 'badge-active';
        const badgeText = alert.resolved ? 'Resolved' : 'Active';
        const notifiedCount = (alert.notifiedContacts || []).filter((contact) => contact.status === 'sent').length;
        const locationText = alert.location?.address || (alert.location?.lat != null && alert.location?.lng != null ? `${alert.location.lat}, ${alert.location.lng}` : 'Location unavailable');
        const hasLocation = alert.location?.lat != null && alert.location?.lng != null;
        
        return `
          <tr data-alert-id="${escapeHtml(alert.id)}">
            <td>${escapeHtml(formatDateTime(alert.timestamp))}</td>
            <td>${escapeHtml(locationText)}</td>
            <td>${escapeHtml(alert.type)}</td>
            <td>${escapeHtml(String(notifiedCount))}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${hasLocation ? `<button class="btn btn-secondary btn-sm" data-map-id="${escapeHtml(alert.id)}">📍 Map</button>` : ''}
                ${!alert.resolved ? `<button class="btn btn-secondary btn-sm" data-resolve-id="${escapeHtml(alert.id)}">✓ Resolve</button>` : '<span style="color: var(--text-light); font-size: 0.85rem;">Resolved</span>'}
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  };

  const openAlertMap = (alert) => {
    if (!window.L) {
      showToast('Map library not loaded. Visit the Map page for full features.', 'warning');
      return;
    }

    const location = alert.location || {};
    if (!location.lat || !location.lng) {
      showToast('No location data available for this alert', 'warning');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'alertMapModal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h3 style="margin: 0;">📍 ${escapeHtml(alert.type || 'Alert')} Location</h3>
          <button type="button" class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>
        <div id="alertMapDiv" style="width: 100%; height: 500px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: var(--spacing-lg);"></div>
        <div style="display: grid; gap: var(--spacing-md); font-size: 0.9rem; padding: 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
            <div>
              <strong style="color: var(--primary);">📍 Location</strong>
              <p style="margin: var(--spacing-sm) 0 0 0; color: var(--text-light);">${escapeHtml(location.address || 'Coordinates')}</p>
            </div>
            <div>
              <strong style="color: var(--primary);">⏰ Time</strong>
              <p style="margin: var(--spacing-sm) 0 0 0; color: var(--text-light);">${escapeHtml(formatDateTime(alert.timestamp))}</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
            <div>
              <strong style="color: var(--primary);">📐 Coordinates</strong>
              <p style="margin: var(--spacing-sm) 0 0 0; color: var(--text-light); font-family: monospace; font-size: 0.85rem;">${location.lat?.toFixed(6)}<br>${location.lng?.toFixed(6)}</p>
            </div>
            <div>
              <strong style="color: var(--primary);">🔄 Status</strong>
              <p style="margin: var(--spacing-sm) 0 0 0; color: var(--text-light);">${alert.resolved ? '✅ Resolved' : '🔴 Active'}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" style="width: 100%;">Close Map</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    let mapInstance = null;
    
    setTimeout(() => {
      const mapDiv = document.getElementById('alertMapDiv');
      if (!mapDiv) return;
      
      mapInstance = L.map(mapDiv).setView([location.lat, location.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      L.circleMarker([location.lat, location.lng], {
        radius: 12,
        fillColor: '#ef4444',
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstance)
        .bindPopup(`<strong>${escapeHtml(alert.type)}</strong><br>${escapeHtml(location.address || 'Location')}`)
        .openPopup();
    }, 100);

    const closeBtn = modal.querySelector('.modal-close');
    const closeModalBtn = modal.querySelector('.modal-footer .btn');

    const cleanup = () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
        mapInstance = null;
      }
      modal.remove();
    };

    closeBtn.addEventListener('click', cleanup);
    closeModalBtn.addEventListener('click', cleanup);
    
    // Also cleanup if user clicks outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cleanup();
    });
  };

  const loadHistory = async () => {
    try {
      const alerts = await apiCall('/alerts/history');
      renderHistory(alerts);
    } catch (error) {
      emptyState?.classList.remove('hidden');
      tableBody.innerHTML = '';
      showToast(error.message || 'Failed to load alert history', 'error');
    }
  };

  tableBody?.addEventListener('click', async (event) => {
    const resolveButton = event.target.closest('button[data-resolve-id]');
    const mapButton = event.target.closest('button[data-map-id]');

    if (resolveButton) {
      const alertId = resolveButton.dataset.resolveId;
      if (!alertId) {
        return;
      }

      try {
        await apiCall(`/alerts/${alertId}/resolve`, 'PUT');
        showToast('Alert resolved', 'success');
        await loadHistory();
      } catch (error) {
        showToast(error.message || 'Failed to resolve alert', 'error');
      }
    }

    if (mapButton) {
      const alertId = mapButton.dataset.mapId;
      if (!alertId || !alertsCache) {
        return;
      }

      const alert = alertsCache.find((a) => a.id === alertId);
      if (alert) {
        openAlertMap(alert);
      }
    }
  });

  refreshBtn?.addEventListener('click', loadHistory);
  logoutBtn?.addEventListener('click', logout);
  await loadHistory();
}

document.addEventListener('DOMContentLoaded', () => {
  const initializers = {
    login: initLoginPage,
    register: initRegisterPage,
    dashboard: initDashboardPage,
    contacts: initContactsPage,
    profile: initProfilePage,
    features: initFeaturesPage,
    history: initHistoryPage,
  };

  const init = initializers[page];
  if (init) {
    init().catch((error) => {
      console.error(`Failed to initialize ${page} page:`, error);
      showToast(error.message || 'Page failed to load', 'error');
    });
  }
});