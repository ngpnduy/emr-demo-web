import express from 'express';
import { getAvailableTimeslots, getPatientAppointments,getProfileExpense } from '../controllers/queryControllers.js';

const router = express.Router();

// Create API

router.get('/timeslots', getAvailableTimeslots);
router.get('/patients/:customerId/appointments', getPatientAppointments);
router.get('/profiles/:profileId/expense', getProfileExpense);

export default router;