import { Router } from 'express';
import {
  getAppliances,
  getApplianceById,
  createAppliance,
  updateAppliance,
  deleteAppliance,
  getApplianceStats,
} from '../controllers/applianceController';
import { validateRequest, validateParams } from '../middleware/validation';
import { ApplianceSchema, UpdateApplianceSchema, UUIDSchema } from '../types';

const router = Router();

// Get appliance statistics (must come before /:id route)
router.get('/stats', getApplianceStats);

// Get all appliances with optional filtering
router.get('/', getAppliances);

// Get single appliance by ID
router.get('/:id', validateParams(UUIDSchema), getApplianceById);

// Create new appliance
router.post('/', validateRequest(ApplianceSchema), createAppliance);

// Update appliance
router.put('/:id', validateParams(UUIDSchema), validateRequest(UpdateApplianceSchema), updateAppliance);

// Delete appliance
router.delete('/:id', validateParams(UUIDSchema), deleteAppliance);

export default router;