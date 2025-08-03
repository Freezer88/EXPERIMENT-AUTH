const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testInvitationSystem() {
  try {
    console.log('🧪 Testing Invitation System...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerData.error) {
      if (registerData.error.includes('already exists')) {
        console.log('✅ Registration: SUCCESS (user already exists)');
      } else {
        console.log('❌ Registration failed:', registerData.message);
        return;
      }
    } else {
      console.log('✅ Registration: SUCCESS (user created)');
    }

    // Step 2: Login to get JWT token
    console.log('\n2. Logging in to get JWT token...');
    const loginResponse = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.message ? 'SUCCESS' : 'FAILED');
    
    if (!loginData.tokens?.accessToken) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.tokens.accessToken;
    console.log('🔑 Got JWT token');

    // Step 3: Create a test account
    console.log('\n3. Creating test account...');
    const accountResponse = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Account'
      })
    });

    const accountData = await accountResponse.json();
    console.log('✅ Account creation:', accountData.success ? 'SUCCESS' : 'FAILED');
    
    if (!accountData.success) {
      console.log('❌ Account creation failed:', accountData.message);
      return;
    }

    const accountId = accountData.account.id;
    console.log(`🏢 Created account: ${accountData.account.name} (ID: ${accountId})`);

    // Step 4: Create an invitation
    console.log('\n4. Creating invitation...');
    const invitationResponse = await fetch(`${BASE_URL}/accounts/${accountId}/invitations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'invitee@example.com',
        role: 'viewer',
        message: 'Welcome to our test account!'
      })
    });

    const invitationData = await invitationResponse.json();
    console.log('✅ Invitation creation:', invitationData.success ? 'SUCCESS' : 'FAILED');
    
    if (invitationData.success) {
      console.log('📧 Invitation created successfully!');
      console.log(`   Email: ${invitationData.invitation.email}`);
      console.log(`   Role: ${invitationData.invitation.role}`);
      console.log(`   Status: ${invitationData.invitation.status}`);
      console.log(`   Expires: ${new Date(invitationData.invitation.expiresAt).toLocaleString()}`);
    } else {
      console.log('❌ Invitation creation failed:', invitationData.message);
    }

    // Step 5: List invitations
    console.log('\n5. Listing invitations...');
    const listResponse = await fetch(`${BASE_URL}/accounts/${accountId}/invitations`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });

    const listData = await listResponse.json();
    console.log('✅ List invitations:', listData.success ? 'SUCCESS' : 'FAILED');
    
    if (listData.success) {
      console.log(`📋 Found ${listData.invitations.length} invitation(s)`);
      listData.invitations.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.email} (${inv.role}) - ${inv.status}`);
      });
    }

    console.log('\n🎉 Invitation system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvitationSystem(); 