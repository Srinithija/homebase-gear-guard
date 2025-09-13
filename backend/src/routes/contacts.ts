import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { ContactSchema, UpdateContactSchema, UUIDSchema, QueryFilterSchema } from '../types';

const router = Router();

// Get all contacts with optional filtering
router.get('/', validateQuery(QueryFilterSchema), getContacts);

// Get single contact by ID
router.get('/:id', validateParams(UUIDSchema), getContactById);

// Create new contact
router.post('/', validateRequest(ContactSchema), createContact);

// Update contact
router.put('/:id', validateParams(UUIDSchema), validateRequest(UpdateContactSchema), updateContact);

// Delete contact
router.delete('/:id', validateParams(UUIDSchema), deleteContact);

export default router;