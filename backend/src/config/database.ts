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

// Create connection with fallback URLs
const createConnectionWithFallback = () => {
  // Try multiple connection options in order of preference
  const connectionUrls = [
    env.DATABASE_URL, // Primary: Transaction pooler
    process.env.DATABASE_URL_POOLER_SESSION, // Fallback 1: Session pooler
    process.env.DATABASE_URL_FALLBACK // Fallback 2: Direct connection
  ].filter(Boolean);

  console.log('🔄 Available connection URLs:', connectionUrls.length);
  
  // Use the primary URL with optimized config
  return postgres(connectionUrls[0]!, connectionConfig);
};

// Create the connection
const sql = createConnectionWithFallback();
export const db = drizzle(sql, { schema });

// Simple connection test function that tries each URL sequentially
export const testConnection = async () => {
  const connectionUrls = [
    { name: 'Transaction Pooler', url: env.DATABASE_URL },
    { name: 'Session Pooler', url: process.env.DATABASE_URL_POOLER_SESSION },
    { name: 'Fallback Connection', url: process.env.DATABASE_URL_FALLBACK },
    { name: 'IPv4 Direct Connection', url: process.env.DATABASE_URL_IPv4_DIRECT }
  ].filter(option => option.url);

  console.log(`🔗 Testing ${connectionUrls.length} database connection options...`);

  for (const { name, url } of connectionUrls) {
    try {
      console.log(`📍 Testing ${name}...`);
      console.log('🔗 URL:', url!.replace(/:[^:@]*@/, ':****@')); // Hide password
      
      // Create a simple test connection with timeout
      const testConfig = {
        ...connectionConfig,
        connect_timeout: 5, // Short timeout for testing
        max: 1 // Single connection for testing
      };
      
      const testSql = postgres(url!, testConfig);
      
      // Simple connectivity test
      await testSql`SELECT 1 as test`;
      await testSql.end();
      
      console.log(`✅ ${name} connection successful!`);
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
      }
      
      // Continue to next option
      continue;
    }
  }
  
  console.error('❌ All database connection options failed');
  console.error('🔧 Suggestions:');
  console.error('   1. Check if Supabase project is active and not paused');
  console.error('   2. Verify database credentials are correct');
  console.error('   3. Ensure network allows outbound connections to Supabase');
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