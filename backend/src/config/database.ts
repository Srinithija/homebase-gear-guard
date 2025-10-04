import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { env } from './env';

// Create the connection
const sql = postgres(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Connection test function
export const testConnection = async () => {
  try {
    console.log('🔗 Testing database connection...');
    console.log('📍 Database URL:', env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password
    
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Additional debugging info with proper type checking
    const errorWithCode = error as { code?: string };
    if (errorWithCode.code === 'ENOTFOUND') {
      console.error('🔍 DNS Resolution failed - possible causes:');
      console.error('   - Incorrect hostname in DATABASE_URL');
      console.error('   - Network connectivity issues');
      console.error('   - Supabase project might be paused/deleted');
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