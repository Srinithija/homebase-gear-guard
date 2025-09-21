import { Request, Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { appliances, maintenanceTasks, contacts } from '../db/schema';
import { successResponse, errorResponse } from '../utils/responses';
import { FilterParams, ApplianceStats } from '../types';

export const getAppliances = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    next(error);
  }
};