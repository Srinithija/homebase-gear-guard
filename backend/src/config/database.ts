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
  const poolerUrl = 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  const connectionUrls = [
    env.DATABASE_URL.includes('pooler') ? env.DATABASE_URL : poolerUrl, // Primary: Use pooler if main URL is old
    process.env.DATABASE_URL_POOLER_SESSION || 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
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
  // Hardcoded fallback URLs with correct pooler authentication format
  const fallbackUrls = {
    pooler_session: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    pooler_transaction: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    pooler_timeout: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=10'
  };

  // Focus on pooler connections only to avoid IPv6 issues
  const connectionUrls = [
    { name: 'Transaction Pooler', url: env.DATABASE_URL.includes('pooler') ? env.DATABASE_URL : fallbackUrls.pooler_transaction },
    { name: 'Session Pooler', url: process.env.DATABASE_URL_POOLER_SESSION || process.env['DATABASE_URL_POOLER_SESSION'] || fallbackUrls.pooler_session },
    { name: 'Pooler with Timeout', url: process.env.DATABASE_URL_FALLBACK || process.env['DATABASE_URL_FALLBACK'] || fallbackUrls.pooler_timeout },
    { name: 'Alternative Pooler', url: process.env.DATABASE_URL_IPv4_DIRECT || process.env['DATABASE_URL_IPv4_DIRECT'] || fallbackUrls.pooler_transaction }
  ].filter(option => option.url);

  console.log(`🔗 Testing ${connectionUrls.length} database connection options...`);
  console.log('📍 Primary DATABASE_URL check:', env.DATABASE_URL.includes('pooler') ? '✅ Using pooler' : '⚠️ Using old hostname');
  console.log('📍 Available URLs:');
  connectionUrls.forEach(({ name, url }) => {
    console.log(`   ${name}: ${url!.replace(/:[^:@]*@/, ':****@')}`);
  });

  for (const { name, url } of connectionUrls) {
    try {
      console.log(`📍 Testing ${name}...`);
      console.log('🔗 URL:', url!.replace(/:[^:@]*@/, ':****@')); // Hide password
      
      // Create a simple test connection with timeout
      const testConfig = {
        ...connectionConfig,
        connect_timeout: 10, // Longer timeout for pooler connections
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
        console.error('🔍 Authentication failed - pooler credential format issue');
        console.error('   💡 Tip: Verify username format for pooler connections');
      } else if ((error as Error).message.includes('password authentication failed')) {
        console.error('🔍 Password authentication failed - check credentials');
      }
      
      // Continue to next option
      continue;
    }
  }
  
  console.error('❌ All database connection options failed');
  console.error('🔧 Troubleshooting suggestions:');
  console.error('   1. Verify Supabase project is active and not paused');
  console.error('   2. Check database password is correct: Srinithija02');
  console.error('   3. Confirm project reference: llwasxekjvvezufpyolq');
  console.error('   4. Try manual connection test with pooler URL');
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