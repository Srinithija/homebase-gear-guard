import { Router } from 'express';
import {
  getMaintenanceTasks,
  getUpcomingMaintenance,
  getMaintenanceTaskById,
  createMaintenanceTask,
  updateMaintenanceTask,
  deleteMaintenanceTask,
} from '../controllers/maintenanceController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { MaintenanceTaskSchema, UpdateMaintenanceTaskSchema, UUIDSchema, QueryFilterSchema } from '../types';

const router = Router();

// Get upcoming maintenance tasks (must come before /:id route)
router.get('/upcoming', validateQuery(QueryFilterSchema), getUpcomingMaintenance);

// Get all maintenance tasks with optional filtering
router.get('/', validateQuery(QueryFilterSchema), getMaintenanceTasks);

// Get single maintenance task by ID
router.get('/:id', validateParams(UUIDSchema), getMaintenanceTaskById);

// Create new maintenance task
router.post('/', validateRequest(MaintenanceTaskSchema), createMaintenanceTask);

// Update maintenance task
router.put('/:id', validateParams(UUIDSchema), validateRequest(UpdateMaintenanceTaskSchema), updateMaintenanceTask);

// Delete maintenance task
router.delete('/:id', validateParams(UUIDSchema), deleteMaintenanceTask);

export default router;