import { Request, Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db, isDatabaseAvailable } from '../config/database';
import { appliances, maintenanceTasks, contacts } from '../db/schema';
import { successResponse, errorResponse } from '../utils/responses';
import { FilterParams, ApplianceStats } from '../types';

// Enhanced database error handler
const handleDatabaseError = async (error: any, res: Response, fallbackData: any = null) => {
  console.error('❌ Database error:', error);
  
  // Check if database is available
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return res.status(503).json({
      success: false,
      message: '🚨 Database temporarily unavailable',
      data: fallbackData,
      fallbackMode: true,
      error: 'DATABASE_UNAVAILABLE',
      instructions: {
        action: 'Database connection failed',
        details: 'The backend cannot connect to the database. This may be due to:',
        causes: [
          'Supabase project is paused (most common)',
          'Network connectivity issues',
          'Database server maintenance',
          'IPv6 connection problems'
        ],
        solutions: [
          '1. Visit: https://app.supabase.com/project/llwasxekjvvezufpyolq',
          '2. Check if project is paused and click "Resume"',
          '3. Upgrade to paid plan to avoid auto-pausing',
          '4. Contact support if issues persist'
        ]
      }
    });
  }
  
  // Handle specific error types
  if (error && typeof error === 'object' && 'message' in error) {
    const message = error.message as string;
    
    if (message.includes('Tenant or user not found')) {
      return res.status(503).json({
        success: false,
        message: '🚨 Supabase project is paused',
        data: fallbackData,
        fallbackMode: true,
        error: 'SUPABASE_PAUSED',
        instructions: {
          action: 'Resume Supabase Project',
          url: 'https://app.supabase.com/project/llwasxekjvvezufpyolq'
        }
      });
    }
    
    if (message.includes('ENETUNREACH') || message.includes('connect')) {
      return res.status(503).json({
        success: false,
        message: '🚨 Network connectivity issue',
        data: fallbackData,
        fallbackMode: true,
        error: 'NETWORK_UNREACHABLE',
        instructions: {
          action: 'Check database connectivity',
          details: 'IPv6 or network routing issue detected'
        }
      });
    }
  }
  
  return null;
};

export const getAppliances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check database availability first
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        success: false,
        message: '🚨 Database unavailable - using fallback mode',
        data: [],
        fallbackMode: true,
        error: 'DATABASE_UNAVAILABLE'
      });
    }
    
    const { search, status } = req.query as FilterParams;
    
    // Build the where condition based on search
    const whereCondition = search ? 
      sql`${appliances.name} ILIKE ${`%${search}%`} OR 
          ${appliances.brand} ILIKE ${`%${search}%`} OR 
          ${appliances.model} ILIKE ${`%${search}%`} OR 
          ${appliances.serialNumber} ILIKE ${`%${search}%`}` : undefined;
    
    const appliancesList = whereCondition ? 
      await db.select().from(appliances).where(whereCondition).orderBy(desc(appliances.createdAt)) :
      await db.select().from(appliances).orderBy(desc(appliances.createdAt));
    
    // Filter by warranty status if needed
    let filteredAppliances = appliancesList;
    if (status && status !== 'all') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      filteredAppliances = appliancesList.filter(appliance => {
        const expiry = new Date(appliance.warrantyExpiry);
        
        switch (status) {
          case 'active':
            return expiry > thirtyDaysFromNow;
          case 'expiring-soon':
            return expiry > today && expiry <= thirtyDaysFromNow;
          case 'expired':
            return expiry <= today;
          default:
            return true;
        }
      });
    }
    
    return successResponse(res, filteredAppliances, 'Appliances retrieved successfully');
  } catch (error) {
    // Handle database connection issues
    const handled = await handleDatabaseError(error, res, []);
    if (handled) return handled;
    
    next(error);
  }
};

export const getApplianceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const appliance = await db.select().from(appliances).where(eq(appliances.id, id));
    
    if (appliance.length === 0) {
      return res.status(404).json(errorResponse('Appliance not found'));
    }
    
    // Get related maintenance tasks and contacts
    const relatedTasks = await db.select().from(maintenanceTasks)
      .where(eq(maintenanceTasks.applianceId, id))
      .orderBy(desc(maintenanceTasks.createdAt));
    
    const relatedContacts = await db.select().from(contacts)
      .where(eq(contacts.applianceId, id))
      .orderBy(desc(contacts.createdAt));
    
    const result = {
      ...appliance[0],
      maintenanceTasks: relatedTasks,
      contacts: relatedContacts,
    };
    
    return successResponse(res, result, 'Appliance retrieved successfully');
  } catch (error) {
    // Handle database connection issues
    const handled = handleDatabaseError(error, res, null);
    if (handled) return handled;
    
    next(error);
  }
};

export const createAppliance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applianceData = req.body;
    
    const newAppliance = await db.insert(appliances).values({
      ...applianceData,
      purchaseDate: applianceData.purchaseDate, // Keep as string
      warrantyExpiry: applianceData.warrantyExpiry, // Keep as string
      updatedAt: new Date(),
    }).returning();
    
    return successResponse(res, newAppliance[0], 'Appliance created successfully', 201);
  } catch (error) {
    // Handle database connection issues
    const handled = handleDatabaseError(error, res, null);
    if (handled) return handled;
    
    next(error);
  }
};

export const updateAppliance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const processedData: any = { ...updateData };
    // Don't convert dates to Date objects, keep them as strings
    processedData.updatedAt = new Date();
    
    const updatedAppliance = await db.update(appliances)
      .set(processedData)
      .where(eq(appliances.id, id))
      .returning();
    
    if (updatedAppliance.length === 0) {
      return res.status(404).json(errorResponse('Appliance not found'));
    }
    
    return successResponse(res, updatedAppliance[0], 'Appliance updated successfully');
  } catch (error) {
    // Handle database connection issues
    const handled = handleDatabaseError(error, res, null);
    if (handled) return handled;
    
    next(error);
  }
};

export const deleteAppliance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedAppliance = await db.delete(appliances)
      .where(eq(appliances.id, id))
      .returning();
    
    if (deletedAppliance.length === 0) {
      return res.status(404).json(errorResponse('Appliance not found'));
    }
    
    return successResponse(res, null, 'Appliance deleted successfully');
  } catch (error) {
    // Handle database connection issues
    const handled = handleDatabaseError(error, res, null);
    if (handled) return handled;
    
    next(error);
  }
};

export const getApplianceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const allAppliances = await db.select().from(appliances);
    
    const stats: ApplianceStats = {
      total: allAppliances.length,
      active: allAppliances.filter(a => new Date(a.warrantyExpiry) > thirtyDaysFromNow).length,
      expiringSoon: allAppliances.filter(a => {
        const expiry = new Date(a.warrantyExpiry);
        return expiry > today && expiry <= thirtyDaysFromNow;
      }).length,
      expired: allAppliances.filter(a => new Date(a.warrantyExpiry) <= today).length,
    };
    
    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    // Handle database connection issues with fallback stats
    const fallbackStats = { total: 0, active: 0, expiringSoon: 0, expired: 0 };
    const handled = handleDatabaseError(error, res, fallbackStats);
    if (handled) return handled;
    
    next(error);
  }
};