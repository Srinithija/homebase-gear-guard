import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';

// Connection pooler optimized configuration
const connectionConfig = {
  // Connection pool settings for pgbouncer compatibility
  max: 1, // Single connection for connection pooler
  idle_timeout: 0, // Disable idle timeout for pooler
  connect_timeout: 10, // Shorter timeout for pooler
  // SSL configuration for production
  ssl: env.NODE_ENV === 'production' ? 'require' as const : false,
  // Disable prepared statements for pgbouncer compatibility
  prepare: false,
  // Connection handling
  transform: {
    undefined: null
  }
};

// Create the connection
const sql = postgres(env.DATABASE_URL, connectionConfig);
export const db = drizzle(sql, { schema });

// Connection test function
export const testConnection = async () => {
  try {
    console.log('🔗 Testing database connection...');
    console.log('📍 Database URL:', env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password
    console.log('🌐 Environment:', env.NODE_ENV);
    
    const sqlInstance = sql;
    await sqlInstance`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Additional debugging info with proper type checking
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
      
      // Try to suggest IPv4 fallback
      const url = new URL(env.DATABASE_URL);
      console.error('🔧 Suggestion: Try using IPv4 hostname if available');
      console.error('   Current hostname:', url.hostname);
    } else if (errorWithCode.code === 'ECONNREFUSED') {
      console.error('🔍 Connection refused - possible causes:');
      console.error('   - Database server is down');
      console.error('   - Port 5432 is blocked');
      console.error('   - Incorrect credentials');
    }
    
    return false;
  }
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