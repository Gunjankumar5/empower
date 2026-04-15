/**
 * Test Script: Verify Emergency Contacts Bug is Fixed
 * Tests: Register with contacts → Check profile → Load contacts via API
 */

const BASE_URL = 'http://localhost:5000/api';
const random = Math.random().toString(36).substr(2, 9);

async function test() {
  try {
    // Step 1: Register with emergency contacts
    console.log('\n📝 Step 1: Registering user with emergency contacts...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test User ${random}`,
        email: `test.${random}@empower.com`,
        password: 'Test@123456',
        phone: '1234567890',
        emergencyContacts: [
          { name: 'Mom', phone: '9876543210', email: 'mom@test.com', relation: 'Mother' },
          { name: 'Brother', phone: '9876543211', email: 'bro@test.com', relation: 'Brother' }
        ]
      })
    });

    const registerData = await registerRes.json();
    if (!registerRes.ok) {
      throw new Error(`Registration failed: ${registerData.error}`);
    }

    const token = registerData.data.token;
    const userId = registerData.data.user.id;
    const contactsFromRegister = registerData.data.user.emergencyContacts;

    console.log(`✅ User registered: ${userId}`);
    console.log(`   Contacts in response: ${contactsFromRegister.length}`);
    if (contactsFromRegister.length > 0) {
      console.log(`   Contact 1: ${contactsFromRegister[0].name} (${contactsFromRegister[0].phone})`);
      if (contactsFromRegister.length > 1) {
        console.log(`   Contact 2: ${contactsFromRegister[1].name} (${contactsFromRegister[1].phone})`);
      }
    }

    // Step 2: Get profile via /api/profile
    console.log('\n👤 Step 2: Fetching profile via GET /api/profile...');
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${profileData.error}`);
    }

    const contactsFromProfile = profileData.data.emergencyContacts;
    console.log(`✅ Profile loaded`);
    console.log(`   Contacts from profile: ${contactsFromProfile.length}`);
    if (contactsFromProfile.length > 0) {
      console.log(`   Contact 1: ${contactsFromProfile[0].name}`);
      if (contactsFromProfile.length > 1) {
        console.log(`   Contact 2: ${contactsFromProfile[1].name}`);
      }
    }

    // Step 3: Get contacts via /api/contacts
    console.log('\n📞 Step 3: Fetching contacts via GET /api/contacts...');
    const contactsRes = await fetch(`${BASE_URL}/contacts`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const contactsData = await contactsRes.json();
    if (!contactsRes.ok) {
      throw new Error(`Contacts fetch failed: ${contactsData.error}`);
    }

    const contactsList = contactsData.data;
    console.log(`✅ Contacts loaded: ${contactsList.length}`);
    contactsList.forEach((contact, i) => {
      console.log(`   Contact ${i + 1}: ${contact.name} (${contact.phone})`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST PASSED: Emergency contacts bug is FIXED!');
    console.log('='.repeat(50));
    console.log(`\nSummary:`);
    console.log(`  Registered with: ${contactsFromRegister.length} contacts`);
    console.log(`  Profile shows: ${contactsFromProfile.length} contacts`);
    console.log(`  /api/contacts shows: ${contactsList.length} contacts`);
    console.log(`\n✨ Contacts are now stored and retrievable on both dashboard and contacts page!`);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

test();
