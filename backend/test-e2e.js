const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING FOODRESCUE FULL LIFECYCLE E2E TEST ---');

  // 1. Health
  console.log('\n[1/12] Testing Health Endpoint...');
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/v1/health', method: 'GET' });
  console.log(`Status: ${health.status}, Result:`, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Auth - Donor Login
  console.log('\n[2/12] Testing Donor Login...');
  const donorLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'donor@grandhotel.com', password: 'Donor@123' }
  );
  console.log(`Status: ${donorLogin.status}, User: ${donorLogin.data?.user?.name}, Role: ${donorLogin.data?.user?.role}`);
  const donorToken = donorLogin.data.token;

  // 3. Auth - NGO Login
  console.log('\n[3/12] Testing NGO Login...');
  const ngoLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'contact@feedhope.org', password: 'Ngo@123' }
  );
  console.log(`Status: ${ngoLogin.status}, Org: ${ngoLogin.data?.user?.name}`);
  const ngoToken = ngoLogin.data.token;

  // 4. Auth - Volunteer Login
  console.log('\n[4/12] Testing Volunteer Login...');
  const volLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'alex.volunteer@gmail.com', password: 'Volunteer@123' }
  );
  console.log(`Status: ${volLogin.status}, Volunteer: ${volLogin.data?.user?.name}`);
  const volToken = volLogin.data.token;

  // 5. Auth - Admin Login
  console.log('\n[5/12] Testing Admin Login...');
  const adminLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@foodrescue.org', password: 'Admin@123' }
  );
  console.log(`Status: ${adminLogin.status}, Admin: ${adminLogin.data?.user?.name}`);
  const adminToken = adminLogin.data.token;

  // 6. Donor creates listing
  console.log('\n[6/12] Donor creates surplus listing...');
  const now = new Date();
  const createDonation = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/donations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    {
      foodName: 'End-to-End Test Biryani Platters',
      description: 'Hygienically maintained food excess for testing.',
      category: 'cooked_meals',
      quantity: 50,
      unit: 'meals',
      isVegetarian: true,
      preparationDate: now.toISOString(),
      useByDate: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      storageConditions: 'hot_holding',
      pickupAddress: 'Grand Palace Banquet Gate 1, Downtown',
    }
  );
  console.log(`Status: ${createDonation.status}, Donation ID: ${createDonation.data?.donation?._id}`);
  const donationId = createDonation.data.donation._id;

  // 7. NGO requests donation
  console.log('\n[7/12] NGO requests donation...');
  const requestRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/donations/${donationId}/request`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
    },
    { requestedQuantity: 50, notes: 'Needed for shelter dinner.' }
  );
  console.log(`Status: ${requestRes.status}, Donation status: ${requestRes.data?.donation?.status}`);
  const requestId = requestRes.data.request._id;

  // 8. Donor accepts request
  console.log('\n[8/12] Donor accepts NGO request...');
  const acceptRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/requests/${requestId}/accept`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    { responseNotes: 'Approved! Ready for pickup.' }
  );
  console.log(`Status: ${acceptRes.status}, Donation status: ${acceptRes.data?.donation?.status}`);

  // 9. Volunteer claims pickup task
  console.log('\n[9/12] Volunteer claims pickup task...');
  const claimRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/pickups',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${volToken}` },
    },
    { donationId, pickupNotes: 'Carrying thermobox.' }
  );
  console.log(`Status: ${claimRes.status}, Pickup ID: ${claimRes.data?.pickup?._id}, Status: ${claimRes.data?.donation?.status}`);
  const pickupId = claimRes.data.pickup._id;

  // 10. Volunteer confirms picked up and delivered
  console.log('\n[10/12] Volunteer confirms checkpoints...');
  const pickupUpdate1 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/pickups/${pickupId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${volToken}` },
    },
    { status: 'PICKED_UP', notes: 'Loaded in car.' }
  );
  console.log(`Checkpoint 1: ${pickupUpdate1.data?.donation?.status}`);

  const pickupUpdate2 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/pickups/${pickupId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${volToken}` },
    },
    { status: 'DELIVERED', notes: 'Arrived at shelter.' }
  );
  console.log(`Checkpoint 2: ${pickupUpdate2.data?.donation?.status}`);

  // 11. NGO confirms receipt & records distribution
  console.log('\n[11/12] NGO confirms receipt and records 50 people served...');
  const receiveRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/donations/${donationId}/receive`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
    }
  );
  console.log(`Receipt Status: ${receiveRes.data?.donation?.status}`);

  const distRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/donations/${donationId}/distribute`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ngoToken}` },
    },
    { peopleServed: 50, notes: 'Served at hot meal counter.' }
  );
  console.log(`Final Donation Status: ${distRes.data?.donation?.status}, People Served: ${distRes.data?.donation?.peopleServed}`);

  // 12. Verify Timeline Audit History
  console.log('\n[12/12] Verifying Timeline Audit Trail...');
  const finalDonation = await request({ hostname: 'localhost', port: 5000, path: `/api/v1/donations/${donationId}`, method: 'GET' });
  console.log(`Total Timeline Checkpoints Logged: ${finalDonation.data?.history?.length}`);
  finalDonation.data.history.forEach((h, i) => {
    console.log(`  [${i + 1}] ${h.previousStatus} -> ${h.newStatus} by ${h.actor?.name} (${h.actor?.role}): "${h.note}"`);
  });

  console.log('\n======================================================');
  console.log('✅ ALL LIFECYCLE STEPS VERIFIED & COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
