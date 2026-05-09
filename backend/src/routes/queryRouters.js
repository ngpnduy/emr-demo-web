import express from 'express';
import { getAvailableTimeslots, getPatientAppointments } from '../controllers/queryControllers.js';

const router = express.Router();

// Create API

router.get('/timeslots', getAvailableTimeslots);
router.get('/patients/:customerId/appointments', getPatientAppointments);
// router.get('/specialties/popular', getPopularSpecialties);

export default router;