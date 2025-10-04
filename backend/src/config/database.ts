import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';

// Optimized connection configuration for cloud platforms
const connectionConfig = {
  // Connection pool settings
  max: 1, // Single connection for connection pooler
  idle_timeout: 0, // Disable idle timeout for pooler
  connect_timeout: 10, // Connection timeout
  // SSL configuration for production
  ssl: env.NODE_ENV === 'production' ? 'require' as const : false,
  // Disable prepared statements for pgbouncer compatibility
  prepare: false,
  // Connection handling
  transform: {
    undefined: null
  }
};

// Create connection with pooler URLs only (avoid IPv6 issues)
const createConnectionWithFallback = () => {
  // Use pooler URLs only to avoid IPv6 connectivity issues
  const poolerUrl = 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  const connectionUrls = [
    env.DATABASE_URL.includes('pooler') ? env.DATABASE_URL : poolerUrl, // Primary: Use pooler if main URL is old
    process.env.DATABASE_URL_POOLER_SESSION || 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    process.env.DATABASE_URL_FALLBACK || poolerUrl, // Pooler connection with timeout
    poolerUrl // Final fallback to pooler
  ].filter(Boolean);

  console.log('🔄 Available connection URLs:', connectionUrls.length);
  console.log('📍 Using primary URL:', connectionUrls[0]!.replace(/:[^:@]*@/, ':****@'));
  
  // Use the primary URL with optimized config
  return postgres(connectionUrls[0]!, connectionConfig);
};

// Create the connection
const sql = createConnectionWithFallback();
export const db = drizzle(sql, { schema });

// Simple connection test function that tries each URL sequentially
export const testConnection = async () => {
  // Try multiple username formats for better compatibility
  const fallbackUrls = {
    pooler_dot_format: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    pooler_standard: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    pooler_session_dot: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    pooler_session_standard: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    direct_connection: 'postgresql://postgres:Srinithija02@db.llwasxekjvvezufpyolq.supabase.co:5432/postgres?sslmode=require'
  };

  // Test multiple formats to find the working one
  const connectionUrls = [
    { name: 'Transaction Pooler (Dot Format)', url: fallbackUrls.pooler_dot_format },
    { name: 'Transaction Pooler (Standard)', url: fallbackUrls.pooler_standard },
    { name: 'Session Pooler (Dot Format)', url: fallbackUrls.pooler_session_dot },
    { name: 'Session Pooler (Standard)', url: fallbackUrls.pooler_session_standard },
    { name: 'Direct Connection (Test)', url: fallbackUrls.direct_connection }
  ];

  console.log(`🔗 Testing ${connectionUrls.length} database connection options...`);
  console.log('📍 Diagnostic Information:');
  console.log('   Project Ref: llwasxekjvvezufpyolq');
  console.log('   Password: Srinithija02');
  console.log('   Region: aws-0-ap-south-1');
  console.log('');

  for (const { name, url } of connectionUrls) {
    try {
      console.log(`📍 Testing ${name}...`);
      console.log('🔗 URL:', url!.replace(/:[^:@]*@/, ':****@')); // Hide password
      
      // Create a simple test connection with timeout
      const testConfig = {
        ...connectionConfig,
        connect_timeout: 15, // Longer timeout for thorough testing
        max: 1 // Single connection for testing
      };
      
      const testSql = postgres(url!, testConfig);
      
      // Simple connectivity test
      await testSql`SELECT 1 as test`;
      await testSql.end();
      
      console.log(`✅ ${name} connection successful!`);
      console.log('🎉 Using this connection for the application');
      return true;
    } catch (error) {
      console.error(`❌ ${name} failed:`, (error as Error).message);
      
      // Additional debugging for common errors
      const errorWithCode = error as { code?: string; address?: string };
      if (errorWithCode.code === 'ENOTFOUND') {
        console.error('🔍 DNS resolution failed - hostname not found');
      } else if (errorWithCode.code === 'ENETUNREACH') {
        console.error('🔍 Network unreachable - IPv6/IPv4 connectivity issue');
        console.error('   Address attempted:', errorWithCode.address);
      } else if (errorWithCode.code === 'ECONNREFUSED') {
        console.error('🔍 Connection refused - server not accepting connections');
      } else if ((error as Error).message.includes('Tenant or user not found')) {
        console.error('🔍 Authentication failed - possible causes:');
        console.error('   - Supabase project is paused (check dashboard)');
        console.error('   - Incorrect username format for this pooler type');
        console.error('   - Wrong password or project reference');
      } else if ((error as Error).message.includes('password authentication failed')) {
        console.error('🔍 Password authentication failed');
        console.error('   - Check password: Srinithija02');
        console.error('   - Verify project reference: llwasxekjvvezufpyolq');
      }
      
      // Continue to next option
      continue;
    }
  }
  
  console.error('❌ All database connection options failed');
  console.error('');
  console.error('🚑 CRITICAL: Check Supabase Project Status');
  console.error('   1. 🔗 Visit: https://app.supabase.com/project/llwasxekjvvezufpyolq');
  console.error('   2. ⚙️ Verify project is not paused');
  console.error('   3. 🔑 Check Settings > Database > Connection info');
  console.error('   4. 💳 Upgrade to paid plan if paused due to inactivity');
  console.error('');
  return false;
};

// Graceful shutdown
export const closeConnection = async () => {
  try {
    await sql.end();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};