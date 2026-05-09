import db from '../config/db.js'; 

export const createAppointment = async (req, res) => {
    try {
        const { 
            appointment_id, time, date, service_type, 
            specialty_id, profile_id, schedule_id, slot_no 
        } = req.body;

        await db.query(
            'CALL sp_insert_appointment(?, ?, ?, ?, ?, ?, ?, ?)',
            [appointment_id, time, date, service_type, specialty_id, profile_id, schedule_id, slot_no]
        );

        res.status(201).json({
            success: true,
            message: 'Created appointment successfully!'
        })

    } catch (error) {
        console.error("Error when calling createAppointment", error);
        res.status(500).json({ message: error.message || "System error" })
    }
}

export const updateAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { 
            new_time, new_date, new_service_type, 
            new_specialty_id, new_profile_id, new_schedule_id, new_slot_no 
        } = req.body;

        await db.query(
            'CALL sp_update_appointment(?, ?, ?, ?, ?, ?, ?, ?)',
            [appointment_id, new_time, new_date, new_service_type, new_specialty_id, new_profile_id, new_schedule_id, new_slot_no]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Updated appointment successfully!' 
        });
    } catch (error) {
        console.error("Error when calling updateAppointment", error);
        res.status(500).json({ message: error.message || "System error" })
    }
}

export const deleteAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;

        await db.query(
            'CALL sp_delete_appointment(?)',
            [appointment_id]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Deleted appointment successfully!' 
        });
    } catch (error) {
        console.error("Error when calling deleteAppointment", error);
        res.status(500).json({ message: error.message || "System error" })
    }
}

