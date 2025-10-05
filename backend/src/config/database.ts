import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';

// Optimized connection configuration for cloud platforms - IPv4 only
const connectionConfig = {
  // Connection pool settings
  max: 1, // Single connection for connection pooler
  idle_timeout: 0, // Disable idle timeout for pooler
  connect_timeout: 5, // Shorter timeout for faster failover
  // SSL configuration for production
  ssl: env.NODE_ENV === 'production' ? 'require' as const : false,
  // Disable prepared statements for pgbouncer compatibility
  prepare: false,
  // Force IPv4 to avoid IPv6 connectivity issues
  host_type: 'ipv4' as any,
  // Connection handling
  transform: {
    undefined: null
  },
  // Additional IPv4 enforcement
  options: {
    'sslmode': 'require'
  }
};

// Create connection with your exact Supabase pooler URLs (IPv4 compatible)
const createConnectionWithFallback = () => {
  // EXACT URLs from your Supabase dashboard - IPv4 compatible poolers (FREE)
  // Region: aws-1-ap-south-1, Password: Srinithija02
  const yourSupabasePoolers = {
    // Session pooler (port 6543) - IPv4 compatible, recommended for persistent connections
    session: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
    // Transaction pooler (port 5432) - IPv4 compatible, recommended for serverless
    transaction: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'
  };
  
  // Priority order: Session pooler first (better for production apps)
  const connectionUrls = [
    // Primary: Session pooler (IPv4 compatible ✅)
    yourSupabasePoolers.session,
    // Secondary: Transaction pooler (IPv4 compatible ✅)
    yourSupabasePoolers.transaction,
    // Environment variables only if they contain 'pooler' (avoid direct connections)
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('pooler') ? process.env.DATABASE_URL : null,
    process.env.DATABASE_URL_POOLER_SESSION,
    process.env.DATABASE_URL_FALLBACK && process.env.DATABASE_URL_FALLBACK.includes('pooler') ? process.env.DATABASE_URL_FALLBACK : null
  ].filter(Boolean);

  console.log('🔄 Creating database connection with your exact Supabase poolers...');
  console.log('📍 Region: aws-1-ap-south-1 (IPv4 compatible)');
  console.log('📍 Primary URL:', connectionUrls[0]!.replace(/:[^:@]*@/, ':****@'));
  console.log('✅ Session pooler connections are IPv4 proxied for free');
  console.log('🚫 Direct connections disabled (requires IPv6 or $4/month)');
  
  try {
    // Use the primary pooler URL with optimized config
    return postgres(connectionUrls[0]!, connectionConfig);
  } catch (error) {
    console.error('❌ Failed to create database connection:', error);
    throw error;
  }
};

// Create the connection with error handling
let sql: postgres.Sql;
let db: any;

try {
  sql = createConnectionWithFallback();
  db = drizzle(sql, { schema });
  console.log('✅ Database connection initialized');
} catch (error) {
  console.error('❌ Failed to initialize database connection:', error);
  // Create a dummy connection for graceful degradation
  sql = null as any;
  db = null as any;
}

export { db, sql };

// Database health check function
export const isDatabaseAvailable = async (): Promise<boolean> => {
  if (!sql || !db) {
    console.log('❌ Database connection not initialized');
    return false;
  }
  
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error instanceof Error ? error.message : error);
    return false;
  }
};

// Enhanced connection test with better error handling
export const testConnection = async () => {
  // Your exact Supabase pooler URLs (IPv4 compatible)
  const fallbackUrls = {
    pooler_dot_format: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    pooler_standard: 'postgresql://postgres:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    pooler_session_dot: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require',
    pooler_session_standard: 'postgresql://postgres:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
  };

  // Test your IPv4-compatible pooler URLs only (no direct connections)
  const connectionUrls = [
    { name: 'Session Pooler (IPv4 Compatible)', url: fallbackUrls.pooler_session_dot },
    { name: 'Transaction Pooler (IPv4 Compatible)', url: fallbackUrls.pooler_dot_format },
    { name: 'Session Pooler (Standard Format)', url: fallbackUrls.pooler_session_standard },
    { name: 'Transaction Pooler (Standard Format)', url: fallbackUrls.pooler_standard }
  ];

  console.log(`🔗 Testing ${connectionUrls.length} IPv4-compatible pooler connections...`);
  console.log('📍 Diagnostic Information:');
  console.log('   Project Ref: llwasxekjvvezufpyolq');
  console.log('   Password: Srinithija02');
  console.log('   Region: aws-1-ap-south-1 (IPv4 compatible)');
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