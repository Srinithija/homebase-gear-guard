#!/usr/bin/env node

/**
 * API Test Script for Home Appliance Tracker Backend
 * 
 * This script tests all the API endpoints to ensure they work correctly.
 * Make sure the server is running on http://localhost:3001 before running this script.
 * 
 * Usage: node test-api.js
 */

const BASE_URL = 'http://localhost:3001';

// Test data
const testAppliance = {
  name: 'Test Samsung Refrigerator',
  brand: 'Samsung',
  model: 'RF28R7351SG',
  serialNumber: 'TEST123456',
  purchaseDate: '2024-01-15',
  warrantyPeriodMonths: 24,
  warrantyExpiry: '2026-01-15',
  purchaseLocation: 'Test Store',
  manualLink: 'https://example.com/manual.pdf',
  receiptLink: 'https://example.com/receipt.pdf'
};

let testApplianceId = null;
let testMaintenanceId = null;
let testContactId = null;

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 0, data: { success: false, message: error.message } };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await makeRequest(`${BASE_URL}/health`);
  
  if (result.status === 200 && result.data.status === 'OK') {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result);
    return false;
  }
}

async function testCreateAppliance() {
  console.log('\n📱 Testing Create Appliance...');
  const result = await makeRequest(`${BASE_URL}/api/appliances`, {
    method: 'POST',
    body: JSON.stringify(testAppliance)
  });
  
  if (result.status === 201 && result.data.success) {
    testApplianceId = result.data.data.id;
    console.log('✅ Create appliance passed, ID:', testApplianceId);
    return true;
  } else {
    console.log('❌ Create appliance failed:', result);
    return false;
  }
}

async function testGetAppliances() {
  console.log('\n📋 Testing Get All Appliances...');
  const result = await makeRequest(`${BASE_URL}/api/appliances`);
  
  if (result.status === 200 && result.data.success && Array.isArray(result.data.data)) {
    console.log(`✅ Get appliances passed, found ${result.data.data.length} appliances`);
    return true;
  } else {
    console.log('❌ Get appliances failed:', result);
    return false;
  }
}

async function testGetApplianceById() {
  if (!testApplianceId) {
    console.log('⏭️ Skipping Get Appliance by ID (no test appliance)');
    return true;
  }
  
  console.log('\n🔍 Testing Get Appliance by ID...');
  const result = await makeRequest(`${BASE_URL}/api/appliances/${testApplianceId}`);
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Get appliance by ID passed');
    return true;
  } else {
    console.log('❌ Get appliance by ID failed:', result);
    return false;
  }
}

async function testCreateMaintenanceTask() {
  if (!testApplianceId) {
    console.log('⏭️ Skipping Create Maintenance Task (no test appliance)');
    return true;
  }
  
  console.log('\n🔧 Testing Create Maintenance Task...');
  const maintenanceTask = {
    applianceId: testApplianceId,
    taskName: 'Test Filter Replacement',
    date: '2024-12-15',
    frequency: 'quarterly',
    serviceProviderName: 'Test HVAC Services',
    serviceProviderContact: '+1-555-TEST-123',
    reminderDate: '2024-12-10',
    completed: false
  };
  
  const result = await makeRequest(`${BASE_URL}/api/maintenance`, {
    method: 'POST',
    body: JSON.stringify(maintenanceTask)
  });
  
  if (result.status === 201 && result.data.success) {
    testMaintenanceId = result.data.data.id;
    console.log('✅ Create maintenance task passed, ID:', testMaintenanceId);
    return true;
  } else {
    console.log('❌ Create maintenance task failed:', result);
    return false;
  }
}

async function testCreateContact() {
  if (!testApplianceId) {
    console.log('⏭️ Skipping Create Contact (no test appliance)');
    return true;
  }
  
  console.log('\n👥 Testing Create Contact...');
  const contact = {
    applianceId: testApplianceId,
    contactName: 'Test Samsung Support',
    phone: '+1-800-TEST-SAM',
    email: 'test@samsung.com',
    notes: 'Test customer support contact'
  };
  
  const result = await makeRequest(`${BASE_URL}/api/contacts`, {
    method: 'POST',
    body: JSON.stringify(contact)
  });
  
  if (result.status === 201 && result.data.success) {
    testContactId = result.data.data.id;
    console.log('✅ Create contact passed, ID:', testContactId);
    return true;
  } else {
    console.log('❌ Create contact failed:', result);
    return false;
  }
}

async function testGetMaintenanceTasks() {
  console.log('\n🔧 Testing Get Maintenance Tasks...');
  const result = await makeRequest(`${BASE_URL}/api/maintenance`);
  
  if (result.status === 200 && result.data.success && Array.isArray(result.data.data)) {
    console.log(`✅ Get maintenance tasks passed, found ${result.data.data.length} tasks`);
    return true;
  } else {
    console.log('❌ Get maintenance tasks failed:', result);
    return false;
  }
}

async function testGetContacts() {
  console.log('\n👥 Testing Get Contacts...');
  const result = await makeRequest(`${BASE_URL}/api/contacts`);
  
  if (result.status === 200 && result.data.success && Array.isArray(result.data.data)) {
    console.log(`✅ Get contacts passed, found ${result.data.data.length} contacts`);
    return true;
  } else {
    console.log('❌ Get contacts failed:', result);
    return false;
  }
}

async function testValidationErrors() {
  console.log('\n⚠️ Testing Validation Errors...');
  
  // Test invalid appliance data
  const invalidAppliance = {
    name: '', // Required field empty
    brand: 'Test',
    model: 'Test',
    purchaseDate: 'invalid-date', // Invalid date format
    warrantyPeriodMonths: -1 // Invalid number
  };
  
  const result = await makeRequest(`${BASE_URL}/api/appliances`, {
    method: 'POST',
    body: JSON.stringify(invalidAppliance)
  });
  
  if (result.status === 400 && !result.data.success) {
    console.log('✅ Validation error handling passed');
    return true;
  } else {
    console.log('❌ Validation error handling failed:', result);
    return false;
  }
}

async function testUpdateAppliance() {
  if (!testApplianceId) {
    console.log('⏭️ Skipping Update Appliance (no test appliance)');
    return true;
  }
  
  console.log('\n✏️ Testing Update Appliance...');
  const updateData = {
    name: 'Updated Test Samsung Refrigerator',
    notes: 'Updated during API testing'
  };
  
  const result = await makeRequest(`${BASE_URL}/api/appliances/${testApplianceId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Update appliance passed');
    return true;
  } else {
    console.log('❌ Update appliance failed:', result);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete test contact
  if (testContactId) {
    await makeRequest(`${BASE_URL}/api/contacts/${testContactId}`, { method: 'DELETE' });
    console.log('🗑️ Deleted test contact');
  }
  
  // Delete test maintenance task
  if (testMaintenanceId) {
    await makeRequest(`${BASE_URL}/api/maintenance/${testMaintenanceId}`, { method: 'DELETE' });
    console.log('🗑️ Deleted test maintenance task');
  }
  
  // Delete test appliance
  if (testApplianceId) {
    await makeRequest(`${BASE_URL}/api/appliances/${testApplianceId}`, { method: 'DELETE' });
    console.log('🗑️ Deleted test appliance');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests for Home Appliance Tracker Backend');
  console.log('📍 Base URL:', BASE_URL);
  
  const tests = [
    testHealthCheck,
    testCreateAppliance,
    testGetAppliances,
    testGetApplianceById,
    testCreateMaintenanceTask,
    testCreateContact,
    testGetMaintenanceTasks,
    testGetContacts,
    testUpdateAppliance,
    testValidationErrors
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      failed++;
    }
  }
  
  // Cleanup
  await cleanup();
  
  // Results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your backend API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server and database configuration.');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with fetch support');
  console.log('💡 Alternatively, install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);