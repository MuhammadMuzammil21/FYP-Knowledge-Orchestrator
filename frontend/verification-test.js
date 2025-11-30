/**
 * Verification Test Script
 * Tests API endpoints against https://asim.daaimali.site/
 * 
 * Run with: node verification-test.js
 */

const API_BASE = 'https://asim.daaimali.site/api';
let authToken = null;

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // Not JSON
    }

    return {
      ok: response.ok,
      status: response.status,
      data: json || text,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealth() {
  console.log('\n🔍 Testing Health Endpoint...');
  const result = await apiCall('GET', '/health');
  
  if (result.ok || result.status === 200) {
    results.passed.push('Health endpoint');
    console.log('✅ Health endpoint accessible');
    return true;
  } else {
    results.failed.push('Health endpoint');
    console.log('❌ Health endpoint failed:', result.status, result.data);
    return false;
  }
}

async function testAuthSignup() {
  console.log('\n🔍 Testing Auth Signup...');
  const testEmail = `test_${Date.now()}@test.com`;
  const result = await apiCall('POST', '/auth/signup', {
    name: 'Test User',
    email: testEmail,
    password: 'testpass123'
  });

  if (result.ok && result.data.access_token) {
    authToken = result.data.access_token;
    results.passed.push('Auth Signup');
    console.log('✅ Signup successful, token received');
    return true;
  } else {
    results.failed.push('Auth Signup');
    console.log('❌ Signup failed:', result.status, result.data);
    return false;
  }
}

async function testAuthLogin() {
  console.log('\n🔍 Testing Auth Login...');
  // Try with a test account (may need to create first)
  const result = await apiCall('POST', '/auth/login', {
    email: 'test@test.com',
    password: 'testpass123'
  });

  if (result.ok && result.data.access_token) {
    authToken = result.data.access_token;
    results.passed.push('Auth Login');
    console.log('✅ Login successful, token received');
    return true;
  } else {
    results.skipped.push('Auth Login (no test account)');
    console.log('⚠️  Login skipped (may need test account):', result.status);
    return false;
  }
}

async function testGetMeetings() {
  console.log('\n🔍 Testing GET /meetings...');
  if (!authToken) {
    results.skipped.push('GET /meetings (no auth token)');
    console.log('⚠️  Skipped - no auth token');
    return false;
  }

  const result = await apiCall('GET', '/meetings', null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings');
    console.log('✅ Meetings list retrieved');
    console.log(`   Found ${result.data.meetings?.length || 0} meetings`);
    return result.data.meetings?.[0]?.meeting_id || null;
  } else {
    results.failed.push('GET /meetings');
    console.log('❌ Failed:', result.status, result.data);
    return null;
  }
}

async function testGetMeetingsPagination() {
  console.log('\n🔍 Testing GET /meetings with pagination...');
  if (!authToken) {
    results.skipped.push('GET /meetings pagination (no auth token)');
    return false;
  }

  const result = await apiCall('GET', '/meetings?limit=10&offset=0', null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings pagination');
    console.log('✅ Pagination works');
    return true;
  } else {
    results.failed.push('GET /meetings pagination');
    console.log('❌ Pagination failed:', result.status);
    return false;
  }
}

async function testGetMeetingStatus(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/status...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/status (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/status`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/status');
    console.log('✅ Status endpoint works');
    console.log(`   Status: ${result.data.status}, Stage: ${result.data.stage}, Progress: ${result.data.progress}%`);
    return true;
  } else {
    results.failed.push('GET /meetings/{id}/status');
    console.log('❌ Status failed:', result.status, result.data);
    return false;
  }
}

async function testGetTranscript(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/transcript...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/transcript (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/transcript`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/transcript');
    console.log('✅ Transcript endpoint works');
    return true;
  } else if (result.status === 404) {
    results.skipped.push('GET /meetings/{id}/transcript (not ready)');
    console.log('⚠️  Transcript not ready yet (404)');
    return false;
  } else {
    results.failed.push('GET /meetings/{id}/transcript');
    console.log('❌ Transcript failed:', result.status);
    return false;
  }
}

async function testGetEntities(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/entities...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/entities (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/entities`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/entities');
    console.log('✅ Entities endpoint works');
    return true;
  } else if (result.status === 404) {
    results.skipped.push('GET /meetings/{id}/entities (not ready)');
    console.log('⚠️  Entities not ready yet (404)');
    return false;
  } else {
    results.failed.push('GET /meetings/{id}/entities');
    console.log('❌ Entities failed:', result.status);
    return false;
  }
}

async function testGetConflicts(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/conflicts...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/conflicts (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/conflicts`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/conflicts');
    console.log('✅ Conflicts endpoint works');
    console.log(`   Found ${result.data.conflicts?.length || 0} conflicts`);
    return true;
  } else if (result.status === 404) {
    results.skipped.push('GET /meetings/{id}/conflicts (not ready)');
    console.log('⚠️  Conflicts not ready yet (404)');
    return false;
  } else {
    results.failed.push('GET /meetings/{id}/conflicts');
    console.log('❌ Conflicts failed:', result.status);
    return false;
  }
}

async function testRagQuery(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/rag/query...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/rag/query (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/rag/query?q=What%20were%20the%20key%20topics?`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/rag/query');
    console.log('✅ RAG query endpoint works');
    console.log(`   Answer length: ${result.data.answer?.length || 0} chars`);
    console.log(`   Context chunks: ${result.data.context?.length || 0}`);
    return true;
  } else if (result.status === 404) {
    results.skipped.push('GET /meetings/{id}/rag/query (not ready)');
    console.log('⚠️  RAG not ready yet (404)');
    return false;
  } else {
    results.failed.push('GET /meetings/{id}/rag/query');
    console.log('❌ RAG query failed:', result.status, result.data);
    return false;
  }
}

async function testSearch(meetingId) {
  console.log('\n🔍 Testing GET /meetings/{id}/search...');
  if (!authToken || !meetingId) {
    results.skipped.push('GET /meetings/{id}/search (no meeting ID)');
    return false;
  }

  const result = await apiCall('GET', `/meetings/${meetingId}/search?q=meeting`, null, authToken);
  
  if (result.ok) {
    results.passed.push('GET /meetings/{id}/search');
    console.log('✅ Search endpoint works');
    console.log(`   Found ${result.data.results?.length || 0} results`);
    return true;
  } else if (result.status === 404) {
    results.skipped.push('GET /meetings/{id}/search (not ready)');
    console.log('⚠️  Search not ready yet (404)');
    return false;
  } else {
    results.failed.push('GET /meetings/{id}/search');
    console.log('❌ Search failed:', result.status);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Verification Tests');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('='.repeat(60));

  // Test health first
  await testHealth();

  // Test auth
  await testAuthSignup();
  if (!authToken) {
    await testAuthLogin();
  }

  // Test meetings endpoints
  const meetingId = await testGetMeetings();
  await testGetMeetingsPagination();
  
  if (meetingId) {
    await testGetMeetingStatus(meetingId);
    await testGetTranscript(meetingId);
    await testGetEntities(meetingId);
    await testGetConflicts(meetingId);
    await testRagQuery(meetingId);
    await testSearch(meetingId);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  results.passed.forEach(test => console.log(`   - ${test}`));
  
  console.log(`\n❌ Failed: ${results.failed.length}`);
  results.failed.forEach(test => console.log(`   - ${test}`));
  
  console.log(`\n⚠️  Skipped: ${results.skipped.length}`);
  results.skipped.forEach(test => console.log(`   - ${test}`));
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runTests().catch(console.error);

