import express from 'express';
import { createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentsControllers.js';

const router = express.Router();

// Create API

router.post("/", createAppointment);
router.put('/:appointment_id', updateAppointment);
router.delete('/:appointment_id', deleteAppointment);

export default router;