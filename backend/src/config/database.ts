import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';

// Optimized connection configuration for Render deployment
const connectionConfig = {
  // Connection pool settings optimized for serverless
  max: 1, // Single connection for pooler
  idle_timeout: 20, // Allow some idle time for Render
  connect_timeout: 10, // Reasonable timeout
  // SSL configuration for production
  ssl: env.NODE_ENV === 'production' ? 'require' as const : false,
  // Disable prepared statements for pooler compatibility
  prepare: false,
  // Connection handling
  transform: {
    undefined: null
  },
  // Additional Render-specific options
  connection: {
    application_name: 'homebase-gear-guard-render'
  }
};

// Create connection with your EXACT Supabase connection strings
const createConnectionWithFallback = () => {
  // Your EXACT connection strings from Supabase dashboard
  const exactSupabaseUrls = {
    // Session pooler (port 6543) - IPv4 compatible, for persistent connections
    session: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
    // Transaction pooler (port 5432) - IPv4 compatible, for serverless/stateless apps
    transaction: 'postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
    // Direct connection (IPv6 - not compatible with Render) - for reference only
    direct: 'postgresql://postgres:Srinithija02@db.llwasxekjvvezufpyolq.supabase.co:5432/postgres'
  };
  
  // Priority order based on Render deployment memory guidelines
  const connectionUrls = [
    // Primary: Transaction pooler (best for Render/serverless)
    exactSupabaseUrls.transaction + '?sslmode=require&connect_timeout=10',
    // Secondary: Session pooler (alternative)
    exactSupabaseUrls.session + '?sslmode=require&connect_timeout=10',
    // Environment variables as fallback
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_FALLBACK,
    process.env.DATABASE_URL_POOLER_SESSION
  ].filter(Boolean);

  console.log('🔄 Creating database connection with EXACT Supabase URLs...');
  console.log('📍 Region: aws-1-ap-south-1');
  console.log('📍 Primary URL:', connectionUrls[0]!.replace(/:[^:@]*@/, ':****@'));
  console.log('✅ Using IPv4-compatible poolers (FREE)');
  console.log('🚫 Direct connection disabled (IPv6/expensive)');
  
  try {
    // Use the primary URL with optimized config for Render
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