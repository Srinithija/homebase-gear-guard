import { Request, Response, NextFunction } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { contacts, appliances } from '../db/schema';
import { successResponse, errorResponse } from '../utils/responses';

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applianceId } = req.query;
    
    const contactsList = applianceId ? 
      await db.select().from(contacts).where(eq(contacts.applianceId, applianceId as string)).orderBy(desc(contacts.createdAt)) :
      await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    
    return successResponse(res, contactsList, 'Contacts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const contact = await db.select().from(contacts).where(eq(contacts.id, id));
    
    if (contact.length === 0) {
      return res.status(404).json(errorResponse('Contact not found'));
    }
    
    return successResponse(res, contact[0], 'Contact retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactData = req.body;
    
    // Verify appliance exists
    const appliance = await db.select().from(appliances).where(eq(appliances.id, contactData.applianceId));
    if (appliance.length === 0) {
      return res.status(404).json(errorResponse('Appliance not found'));
    }
    
    const newContact = await db.insert(contacts).values(contactData).returning();
    
    return successResponse(res, newContact[0], 'Contact created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedContact = await db.update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();
    
    if (updatedContact.length === 0) {
      return res.status(404).json(errorResponse('Contact not found'));
    }
    
    return successResponse(res, updatedContact[0], 'Contact updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedContact = await db.delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    
    if (deletedContact.length === 0) {
      return res.status(404).json(errorResponse('Contact not found'));
    }
    
    return successResponse(res, null, 'Contact deleted successfully');
  } catch (error) {
    next(error);
  }
};