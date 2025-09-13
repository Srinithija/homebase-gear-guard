import { Router } from 'express';
import applianceRoutes from './appliances';
import maintenanceRoutes from './maintenance';
import contactRoutes from './contacts';

const router = Router();

router.use('/appliances', applianceRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/contacts', contactRoutes);

export default router;