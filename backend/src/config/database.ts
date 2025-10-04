import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';
import { lookup } from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(lookup);

// Force IPv4 by resolving hostname to IPv4 address
const forceIPv4Connection = async (url: string): Promise<string> => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    console.log(`🔍 Resolving ${hostname} to IPv4...`);
    const { address } = await lookupAsync(hostname, { family: 4 });
    console.log(`✅ Resolved to IPv4: ${address}`);
    
    // Replace hostname with IPv4 address
    return url.replace(hostname, address);
  } catch (error) {
    console.warn(`⚠️ IPv4 resolution failed for ${url}:`, error);
    return url; // Return original URL as fallback
  }
};

// Connection pooler optimized configuration
const connectionConfig = {
  // Connection pool settings for pgbouncer compatibility
  max: 1, // Single connection for connection pooler
  idle_timeout: 0, // Disable idle timeout for pooler
  connect_timeout: 15, // Longer timeout for IPv4 resolution
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

// Connection test function with IPv4 resolution and fallbacks
export const testConnection = async () => {
  const connectionUrls = [
    { name: 'Transaction Pooler', url: env.DATABASE_URL },
    { name: 'Session Pooler', url: process.env.DATABASE_URL_POOLER_SESSION },
    { name: 'Direct Connection', url: process.env.DATABASE_URL_FALLBACK },
    { name: 'IPv4 Direct Connection', url: process.env.DATABASE_URL_IPv4_DIRECT }
  ].filter(option => option.url);

  for (const { name, url } of connectionUrls) {
    try {
      console.log(`🔗 Testing ${name}...`);
      console.log('📍 Database URL:', url!.replace(/:[^:@]*@/, ':****@')); // Hide password
      console.log('🌐 Environment:', env.NODE_ENV);
      
      let finalUrl = url!;
      
      // For non-IPv4 direct connections, try IPv4 resolution
      if (!name.includes('IPv4 Direct')) {
        try {
          finalUrl = await forceIPv4Connection(url!);
          console.log('🔗 Using IPv4 URL:', finalUrl.replace(/:[^:@]*@/, ':****@'));
        } catch (error) {
          console.log('⚠️ IPv4 resolution failed, using original URL');
        }
      }
      
      const testSql = postgres(finalUrl, connectionConfig);
      await testSql`SELECT 1`;
      await testSql.end();
      
      console.log(`✅ ${name} connection successful`);
      return true;
    } catch (error) {
      console.error(`❌ ${name} connection failed:`, error);
      
      // Additional debugging info
      const errorWithCode = error as { code?: string; address?: string; syscall?: string };
      
      if (errorWithCode.code === 'ENOTFOUND') {
        console.error('🔍 DNS Resolution failed - possible causes:');
        console.error('   - Incorrect hostname in DATABASE_URL');
        console.error('   - Network connectivity issues');
        console.error('   - Supabase project might be paused/deleted');
      } else if (errorWithCode.code === 'ENETUNREACH') {
        console.error('🔍 Network unreachable - possible causes:');
        console.error('   - IPv6 connectivity issues (trying to force IPv4)');
        console.error('   - Firewall blocking connection');
        console.error('   - Cloud platform network restrictions');
        console.error('   - Address:', errorWithCode.address);
      } else if (errorWithCode.code === 'ECONNREFUSED') {
        console.error('🔍 Connection refused - possible causes:');
        console.error('   - Database server is down');
        console.error('   - Port blocked');
        console.error('   - Incorrect credentials');
      }
      
      console.log(`🔄 Trying next connection option...`);
    }
  }
  
  console.error('❌ All connection options failed');
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