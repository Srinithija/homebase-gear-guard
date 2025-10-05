import { Request, Response, NextFunction } from 'express';
import { eq, desc, and, lte, gte, sql } from 'drizzle-orm';
import { db, isDatabaseAvailable } from '../config/database';
import { maintenanceTasks, appliances } from '../db/schema';
import { successResponse, errorResponse } from '../utils/responses';

// Enhanced database error handler
const handleDatabaseError = async (error: any, res: Response, fallbackData: any = null) => {
  console.error('❌ Database error in maintenance controller:', error);
  
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return res.status(503).json({
      success: false,
      message: '🚨 Database temporarily unavailable',
      data: fallbackData,
      fallbackMode: true,
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  
  return null;
};

export const getMaintenanceTasks = async (req: Request, res: Response, next: NextFunction) => {
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
    
    const { applianceId } = req.query;
    
    const tasks = applianceId ? 
      await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.applianceId, applianceId as string)).orderBy(desc(maintenanceTasks.createdAt)) :
      await db.select().from(maintenanceTasks).orderBy(desc(maintenanceTasks.createdAt));
    
    return successResponse(res, tasks, 'Maintenance tasks retrieved successfully');
  } catch (error) {
    const handled = await handleDatabaseError(error, res, []);
    if (handled) return handled;
    
    next(error);
  }
};

export const getUpcomingMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days = '14' } = req.query;
    const daysAhead = parseInt(days as string);
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    const upcomingTasks = await db.select({
      id: maintenanceTasks.id,
      taskName: maintenanceTasks.taskName,
      reminderDate: maintenanceTasks.reminderDate,
      frequency: maintenanceTasks.frequency,
      serviceProviderName: maintenanceTasks.serviceProviderName,
      serviceProviderContact: maintenanceTasks.serviceProviderContact,
      completed: maintenanceTasks.completed,
      applianceId: maintenanceTasks.applianceId,
      applianceName: appliances.name,
    })
    .from(maintenanceTasks)
    .innerJoin(appliances, eq(maintenanceTasks.applianceId, appliances.id))
    .where(
      and(
        eq(maintenanceTasks.completed, false),
        lte(maintenanceTasks.reminderDate, futureDate.toISOString().split('T')[0]),
        gte(maintenanceTasks.reminderDate, today.toISOString().split('T')[0])
      )
    )
    .orderBy(maintenanceTasks.reminderDate);
    
    return successResponse(res, upcomingTasks, 'Upcoming maintenance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const task = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, id));
    
    if (task.length === 0) {
      return res.status(404).json(errorResponse('Maintenance task not found'));
    }
    
    return successResponse(res, task[0], 'Maintenance task retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskData = req.body;
    
    // Verify appliance exists
    const appliance = await db.select().from(appliances).where(eq(appliances.id, taskData.applianceId));
    if (appliance.length === 0) {
      return res.status(404).json(errorResponse('Appliance not found'));
    }
    
    // Keep dates as strings, don't convert to Date objects
    const processedData = {
      ...taskData,
      // date and reminderDate should remain as strings since the schema expects date type
    };
    
    const newTask = await db.insert(maintenanceTasks).values(processedData).returning();
    
    return successResponse(res, newTask[0], 'Maintenance task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Keep dates as strings if they exist, don't convert to Date objects
    const processedData: any = { ...updateData };
    // date and reminderDate should remain as strings since the schema expects date type
    
    const updatedTask = await db.update(maintenanceTasks)
      .set(processedData)
      .where(eq(maintenanceTasks.id, id))
      .returning();
    
    if (updatedTask.length === 0) {
      return res.status(404).json(errorResponse('Maintenance task not found'));
    }
    
    return successResponse(res, updatedTask[0], 'Maintenance task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenanceTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedTask = await db.delete(maintenanceTasks)
      .where(eq(maintenanceTasks.id, id))
      .returning();
    
    if (deletedTask.length === 0) {
      return res.status(404).json(errorResponse('Maintenance task not found'));
    }
    
    return successResponse(res, null, 'Maintenance task deleted successfully');
  } catch (error) {
    next(error);
  }
};