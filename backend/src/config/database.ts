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

// Create connection with aggressive IPv4-only pooler strategy
const createConnectionWithFallback = () => {
  // IPv4-only pooler URLs with explicit parameters to avoid IPv6
  const ipv4PoolerUrls = {
    // Transaction pooler with dot format (most reliable)
    primary: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=5',
    // Session pooler with dot format
    session: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=5',
    // Transaction pooler with standard format (fallback)
    standard: 'postgresql://postgres:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=5'
  };
  
  // Priority order: Use only pooler URLs to avoid IPv6 issues
  const connectionUrls = [
    // First try environment variable if it's a pooler URL
    env.DATABASE_URL && env.DATABASE_URL.includes('pooler') ? env.DATABASE_URL : null,
    // Then try our hardcoded IPv4 pooler URLs
    ipv4PoolerUrls.primary,
    ipv4PoolerUrls.session,
    ipv4PoolerUrls.standard,
    // Environment fallbacks
    process.env.DATABASE_URL_POOLER_SESSION,
    process.env.DATABASE_URL_FALLBACK
  ].filter(Boolean);

  console.log('🔄 Creating database connection...');
  console.log('📍 Total connection options:', connectionUrls.length);
  console.log('📍 Primary URL:', connectionUrls[0]!.replace(/:[^:@]*@/, ':****@'));
  console.log('⚠️ IPv6 connections disabled - using pooler URLs only');
  
  try {
    // Use the primary URL with IPv4-optimized config
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